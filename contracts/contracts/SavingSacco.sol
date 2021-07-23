// "SPDX-License-Identifier: MIT"
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts//math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

// import "./Initializable.sol";
// import "./IERC20Token.sol";

contract SavingSacco is ReentrancyGuard, Ownable, Initializable{
  using SafeMath for uint256;

  struct Circle {
    address owner;
    string name;
    address[] members;
    uint256 currentIndex;
    uint256 depositAmount;
    address tokenAddress;
    uint256 timestamp;
    mapping(address => uint256) balances;
  }
  mapping (bytes32 => Circle) circles;
  mapping (address => bytes32[]) circleMemberships;

  function initialize() external initializer {
    transferOwnership(msg.sender);
  }

  function circleMembers(bytes32 hashedName) public view returns (address[] memory) {
    return circles[hashedName].members;
  }

  function circlesFor(address user) public view returns (bytes32[] memory) {
    return circleMemberships[user];
  }

  function circleInfo(bytes32 hashedName) public view returns (string memory, address[] memory, address, uint256, uint256, uint256) {
    Circle storage circle = circles[hashedName];
    return (circle.name, circle.members, circle.tokenAddress, circle.depositAmount, circle.timestamp, circle.currentIndex);
  }

  function addCircle(string calldata name, address[] calldata members, address tokenAddress, uint256 depositAmount) external {
    bytes32 hashedName = keccak256(abi.encodePacked(name));

    require(circleMembers(hashedName).length == 0, "Already added circle");

    Circle storage circle = circles[hashedName];

    circle.owner = msg.sender;
    circle.members = members;
    circle.tokenAddress = tokenAddress;
    circle.depositAmount = depositAmount;
    circle.name = name;
    // solhint-disable-next-line not-rely-on-time
    circle.timestamp = block.timestamp;

    for (uint256 index = 0; index < members.length; index++) {
      circleMemberships[members[index]].push(hashedName);
    }
  }

  function balancesForCircle(bytes32 hashedName) external view returns (address[] memory, uint256[] memory) {
    Circle storage circle = circles[hashedName];

    require(circle.members.length != 0, "Circle does not exist");

    uint256[] memory balances = new uint256[](circle.members.length);

    for (uint256 index = 0; index < circle.members.length; index++) {
      balances[index] = circle.balances[circle.members[index]];
    }

    return (circle.members, balances);
  }


  function contribute(bytes32 hashedName, uint256 value) external payable{
    Circle storage circle = circles[hashedName];

    require(circle.members.length != 0, "Circle does not exist");

    require(
      IERC20(circle.tokenAddress).transferFrom(
        msg.sender,
        address(this),
        value
      ),
      "Transfer of contribution failed"
    );

    circle.balances[msg.sender] = circle.balances[msg.sender].add(value);
  }

  function withdrawable(bytes32 hashedName) public view returns (bool) {
    Circle storage circle = circles[hashedName];

    require(circle.members.length != 0, "Circle does not exist");

    for (uint256 index = 0; index < circle.members.length; index++) {
      if (circle.balances[circle.members[index]] < circle.depositAmount && circle.currentIndex != index) {
        return false;
      }
    }

    return true;
  }

  function withdraw(bytes32 hashedName) external {
    Circle storage circle = circles[hashedName];

    require(circle.members.length != 0, "Circle does not exist");

    require(withdrawable(hashedName), "Circle is not withdrawable");

    require(circle.members[circle.currentIndex] == msg.sender, "It's not our turn");

    require(
      IERC20(circle.tokenAddress).transfer(
        msg.sender,
        circle.depositAmount.mul(circle.members.length.sub(1))
      ),
      "Transfer of withdrawal failed"
    );

    for (uint256 index = 0; index < circle.members.length; index++) {
      if (circle.currentIndex != index) {
        circle.balances[circle.members[index]] = circle.balances[circle.members[index]].sub(circle.depositAmount);
      }
    }

    circle.currentIndex = circle.currentIndex.add(1).mod(circle.members.length);
    // solhint-disable-next-line not-rely-on-time
    circle.timestamp = block.timestamp;
  }
}

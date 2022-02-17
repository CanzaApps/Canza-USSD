const Agent = require('../models/agents.model');

exports.createAgent = async ({ agentName, firstName, lastName, phoneNumber, agentLocation }) => {
    const newAgent = new Agent({ agentName, firstName, lastName, phoneNumber, agentLocation, isVerified: true })

    newAgent.save(function(error){
        console.log(error)
    })
}

exports.getAgentLocation = async (agentLocation) => {
    const agent = await Agent.findOne({ agentLocation })
    return agent
}


// chatlog.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const Users = require('./user');

const ChatLogs = sequelize.define('ChatLogs', {
    // Assuming you have an ID field
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Users,
            key: 'id'
        }
    },
    sessionId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING(10000),
    },
    response: {
        type: DataTypes.STRING(10000), 
    },

    // other fields...
});

ChatLogs.belongsTo(Users, { foreignKey: 'userId' });
Users.hasMany(ChatLogs, { foreignKey: 'userId' });

module.exports = ChatLogs;

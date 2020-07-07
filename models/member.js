'use strict';
module.exports = (sequelize, DataTypes) => {
  const member = sequelize.define('member', {
    memberId: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    defaultArticleId: DataTypes.STRING
  }, {});
  member.associate = function(models) {
    // associations can be defined here
  };
  return member;
};
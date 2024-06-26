import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db";
import User from "./User";

class Parent extends Model {}

Parent.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: User,
      key: "id",
    }
  },
  INE: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: "Parent",
  tableName: "Parent"
});

User.hasOne(Parent, {
  foreignKey: {
    name: "id",
    allowNull: false,
  }
});
Parent.belongsTo(User, {
  foreignKey: {
    name: "id",
    allowNull: false,
  }
});

export default Parent;

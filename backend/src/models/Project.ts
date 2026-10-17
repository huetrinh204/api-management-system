import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';

export interface ProjectAttributes {
  id: number;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  status: 'Active' | 'Archived';
  created_by: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class Project extends Model<ProjectAttributes> implements ProjectAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public description!: string | null;
  public color!: string | null;
  public status!: 'Active' | 'Archived';
  public created_by!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Archived'),
      allowNull: false,
      defaultValue: 'Active',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'projects',
    timestamps: true,
    paranoid: true,
  }
);

export default Project;

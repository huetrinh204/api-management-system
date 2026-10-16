import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type IssuePriority = 'Low' | 'Medium' | 'High';
export type IssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Reopened';

export interface IssueAttributes {
  id: number;
  api_doc_id: number;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  created_by: number;
  assigned_to: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type IssueCreationAttributes = Optional<IssueAttributes, 'id' | 'status' | 'assigned_to'>;

class Issue extends Model<IssueAttributes, IssueCreationAttributes> implements IssueAttributes {
  public id!: number;
  public api_doc_id!: number;
  public title!: string;
  public description!: string;
  public priority!: IssuePriority;
  public status!: IssueStatus;
  public created_by!: number;
  public assigned_to!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Issue.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    api_doc_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Open', 'In Progress', 'Resolved', 'Closed', 'Reopened'),
      allowNull: false,
      defaultValue: 'Open',
    },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    assigned_to: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: 'issues',
    timestamps: true,
    underscored: false,
  }
);

export default Issue;

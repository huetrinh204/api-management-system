import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ApiDocStatus = 'Draft' | 'Active' | 'Deprecated';

export interface ApiDocAttributes {
  id: number;
  name: string;
  method: HttpMethod;
  endpoint: string;
  description: string;
  request_sample: string | null;
  response_sample: string | null;
  status: ApiDocStatus;
  created_by: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type ApiDocCreationAttributes = Optional<ApiDocAttributes, 'id' | 'request_sample' | 'response_sample' | 'deletedAt'>;

class ApiDoc extends Model<ApiDocAttributes, ApiDocCreationAttributes> implements ApiDocAttributes {
  public id!: number;
  public name!: string;
  public method!: HttpMethod;
  public endpoint!: string;
  public description!: string;
  public request_sample!: string | null;
  public response_sample!: string | null;
  public status!: ApiDocStatus;
  public created_by!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

ApiDoc.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    method: {
      type: DataTypes.ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE'),
      allowNull: false,
    },
    endpoint: { type: DataTypes.STRING(500), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    request_sample: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    response_sample: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    status: {
      type: DataTypes.ENUM('Draft', 'Active', 'Deprecated'),
      allowNull: false,
      defaultValue: 'Draft',
    },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'api_docs',
    timestamps: true,
    paranoid: true, // bật soft delete: tự quản lý deletedAt
    deletedAt: 'deletedAt',
    underscored: false,
  }
);

export default ApiDoc;

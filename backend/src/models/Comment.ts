import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface CommentAttributes {
  id: number;
  content: string;
  user_id: number;
  api_doc_id: number | null;
  issue_id: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type CommentCreationAttributes = Optional<CommentAttributes, 'id' | 'api_doc_id' | 'issue_id'>;

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public content!: string;
  public user_id!: number;
  public api_doc_id!: number | null;
  public issue_id!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    api_doc_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    issue_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: 'comments',
    timestamps: true,
    underscored: false,
  }
);

export default Comment;

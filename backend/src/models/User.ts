import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type UserRole = 'Admin' | 'BA' | 'Backend Developer' | 'Frontend Developer' | 'Tester';

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password_hash!: string;
  public role!: UserRole;
  public is_active!: boolean;
  public avatar_url!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM('Admin', 'BA', 'Backend Developer', 'Frontend Developer', 'Tester'),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: false,
  }
);

export default User;

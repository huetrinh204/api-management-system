import User from './User';
import ApiDoc from './ApiDoc';
import Issue from './Issue';
import Comment from './Comment';
import Project from './Project';

// User associations
User.hasMany(ApiDoc, { foreignKey: 'created_by', as: 'createdApiDocs' });
User.hasMany(Issue, { foreignKey: 'created_by', as: 'createdIssues' });
User.hasMany(Issue, { foreignKey: 'assigned_to', as: 'assignedIssues' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
User.hasMany(Project, { foreignKey: 'created_by', as: 'createdProjects' });

// Project associations
Project.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Project.hasMany(ApiDoc, { foreignKey: 'project_id', as: 'apiDocs' });

// ApiDoc associations
ApiDoc.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
ApiDoc.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
ApiDoc.hasMany(Issue, { foreignKey: 'api_doc_id', as: 'issues' });
ApiDoc.hasMany(Comment, { foreignKey: 'api_doc_id', as: 'comments' });

// Issue associations
Issue.belongsTo(ApiDoc, { foreignKey: 'api_doc_id', as: 'apiDoc' });
Issue.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Issue.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
Issue.hasMany(Comment, { foreignKey: 'issue_id', as: 'comments' });

// Comment associations
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Comment.belongsTo(ApiDoc, { foreignKey: 'api_doc_id', as: 'apiDoc' });
Comment.belongsTo(Issue, { foreignKey: 'issue_id', as: 'issue' });

export { User, ApiDoc, Issue, Comment, Project };

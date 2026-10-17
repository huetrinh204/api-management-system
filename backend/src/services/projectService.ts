import { Project, User, ApiDoc } from '../models';
import { Op } from 'sequelize';

// Default color palette
const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
];

// Helper: Get random color from palette
function getRandomColor(): string {
  return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
}

// Helper: Validate HEX color format
function validateColor(color: string): boolean {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexRegex.test(color);
}

// Helper: Normalize code to uppercase
function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export interface ProjectFilters {
  status?: 'Active' | 'Archived';
  search?: string;
}

export interface CreateProjectData {
  name: string;
  code: string;
  description?: string | null;
  color?: string | null;
  status?: 'Active' | 'Archived';
}

export interface UpdateProjectData {
  name?: string;
  code?: string;
  description?: string | null;
  color?: string | null;
  status?: 'Active' | 'Archived';
}

// Get list of projects with filters
export async function getProjects(filters: ProjectFilters = {}) {
  const where: any = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${filters.search}%` } },
      { code: { [Op.like]: `%${filters.search}%` } },
    ];
  }

  const projects = await Project.findAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'role'],
      },
    ],
    order: [['updatedAt', 'DESC']],
  });

  // Add apiDocsCount for each project
  const projectsWithCount = await Promise.all(
    projects.map(async (project) => {
      const apiDocsCount = await ApiDoc.count({
        where: { project_id: project.id },
      });
      
      return {
        ...project.toJSON(),
        apiDocsCount,
      };
    })
  );

  return projectsWithCount;
}

// Get project by ID
export async function getProjectById(id: number) {
  const project = await Project.findByPk(id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'role'],
      },
    ],
  });

  if (!project) {
    const error: any = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  // Count API docs in this project
  const apiDocsCount = await ApiDoc.count({
    where: { project_id: id },
  });

  return {
    ...project.toJSON(),
    apiDocsCount,
  };
}

// Create new project
export async function createProject(data: CreateProjectData, userId: number) {
  // Normalize code
  const normalizedCode = normalizeCode(data.code);

  // Validate code uniqueness
  const existingProject = await Project.findOne({
    where: { code: normalizedCode },
    paranoid: false, // Check including soft-deleted projects
  });

  if (existingProject) {
    const error: any = new Error(`Project code "${normalizedCode}" already exists`);
    error.statusCode = 422;
    throw error;
  }

  // Validate color if provided
  if (data.color && !validateColor(data.color)) {
    const error: any = new Error('Invalid color format. Use HEX format like #3B82F6');
    error.statusCode = 422;
    throw error;
  }

  // Assign default color if not provided
  const color = data.color || getRandomColor();

  const project = await Project.create({
    name: data.name.trim(),
    code: normalizedCode,
    description: data.description?.trim() || null,
    color,
    status: data.status || 'Active',
    created_by: userId,
  } as any);

  return project;
}

// Update project
export async function updateProject(id: number, data: UpdateProjectData) {
  const project = await Project.findByPk(id);

  if (!project) {
    const error: any = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  // If code is being changed, validate uniqueness
  if (data.code && data.code !== project.code) {
    const normalizedCode = normalizeCode(data.code);
    const existingProject = await Project.findOne({
      where: {
        code: normalizedCode,
        id: { [Op.ne]: id },
      },
      paranoid: false,
    });

    if (existingProject) {
      const error: any = new Error(`Project code "${normalizedCode}" already exists`);
      error.statusCode = 422;
      throw error;
    }

    project.code = normalizedCode;
  }

  // Validate color if provided
  if (data.color && !validateColor(data.color)) {
    const error: any = new Error('Invalid color format. Use HEX format like #3B82F6');
    error.statusCode = 422;
    throw error;
  }

  // Update fields
  if (data.name !== undefined) project.name = data.name.trim();
  if (data.description !== undefined) project.description = data.description?.trim() || null;
  if (data.color !== undefined) project.color = data.color;
  if (data.status !== undefined) project.status = data.status;

  await project.save();

  return project;
}

// Soft delete project
export async function deleteProject(id: number) {
  const project = await Project.findByPk(id);

  if (!project) {
    const error: any = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  // Set project_id = NULL for all API docs in this project
  await ApiDoc.update(
    { project_id: null },
    { where: { project_id: id } }
  );

  // Soft delete project
  await project.destroy();

  return { message: 'Project deleted successfully' };
}

// Get API docs by project
export async function getApiDocsByProject(projectId: number, filters: any = {}) {
  // Verify project exists
  const project = await Project.findByPk(projectId);
  if (!project) {
    const error: any = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const where: any = { project_id: projectId };

  if (filters.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${filters.search}%` } },
      { endpoint: { [Op.like]: `%${filters.search}%` } },
    ];
  }

  if (filters.method) {
    where.method = filters.method;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const apiDocs = await ApiDoc.findAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'role'],
      },
    ],
    order: [['updatedAt', 'DESC']],
  });

  return apiDocs;
}

// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { Project, Environment, ProjectEnvironment } from '@/types/project';

// interface ProjectContextType {
//   currentProject: Project | null;
//   projects: Project[];
//   currentEnvironment: Environment;
//   setCurrentProject: (project: Project) => void;
//   setCurrentEnvironment: (env: Environment) => void;
//   createProject: (project: Partial<Project>) => Promise<void>;
//   updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
//   deleteProject: (id: string) => Promise<void>;
//   getProjectEnvironment: (projectId: string, env: Environment) => Promise<ProjectEnvironment>;
// }

// const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// export function ProjectProvider({ children }: { children: ReactNode }) {
//   const [currentProject, setCurrentProject] = useState<Project | null>(null);
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [currentEnvironment, setCurrentEnvironment] = useState<Environment>('development');

//   // Load projects from API
//   useEffect(() => {
//     // TODO: Implement API call to fetch projects
//     const fetchProjects = async () => {
//       try {
//         // const response = await api.get('/projects');
//         // setProjects(response.data);
//       } catch (error) {
//         console.error('Failed to fetch projects:', error);
//       }
//     };

//     fetchProjects();
//   }, []);

//   const createProject = async (project: Partial<Project>) => {
//     try {
//       // TODO: Implement API call to create project
//       // const response = await api.post('/projects', project);
//       // setProjects([...projects, response.data]);
//     } catch (error) {
//       console.error('Failed to create project:', error);
//       throw error;
//     }
//   };

//   const updateProject = async (id: string, updates: Partial<Project>) => {
//     try {
//       // TODO: Implement API call to update project
//       // const response = await api.put(`/projects/${id}`, updates);
//       // setProjects(projects.map(p => p.id === id ? response.data : p));
//       // if (currentProject?.id === id) {
//       //   setCurrentProject(response.data);
//       // }
//     } catch (error) {
//       console.error('Failed to update project:', error);
//       throw error;
//     }
//   };

//   const deleteProject = async (id: string) => {
//     try {
//       // TODO: Implement API call to delete project
//       // await api.delete(`/projects/${id}`);
//       // setProjects(projects.filter(p => p.id !== id));
//       // if (currentProject?.id === id) {
//       //   setCurrentProject(null);
//       // }
//     } catch (error) {
//       console.error('Failed to delete project:', error);
//       throw error;
//     }
//   };

//   const getProjectEnvironment = async (projectId: string, env: Environment) => {
//     try {
//       // TODO: Implement API call to get project environment
//       // const response = await api.get(`/projects/${projectId}/environments/${env}`);
//       // return response.data;
//       return {} as ProjectEnvironment;
//     } catch (error) {
//       console.error('Failed to get project environment:', error);
//       throw error;
//     }
//   };

//   return (
//     <ProjectContext.Provider
//       value={{
//         currentProject,
//         projects,
//         currentEnvironment,
//         setCurrentProject,
//         setCurrentEnvironment,
//         createProject,
//         updateProject,
//         deleteProject,
//         getProjectEnvironment,
//       }}
//     >
//       {children}
//     </ProjectContext.Provider>
//   );
// }

// export function useProject() {
//   const context = useContext(ProjectContext);
//   if (context === undefined) {
//     throw new Error('useProject must be used within a ProjectProvider');
//   }
//   return context;
// }

// import { useState } from 'react';
// import { useProject } from '@/context/ProjectContext';
// import { Environment } from '@/types/project';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Plus,
//   Settings,
//   Users,
//   Activity,
//   Box,
//   BarChart,
//   AlertTriangle,
//   Trash,
//   Edit,
// } from 'lucide-react';

// const ProjectDashboard = () => {
//   const {
//     currentProject,
//     projects,
//     currentEnvironment,
//     setCurrentProject,
//     setCurrentEnvironment,
//     createProject,
//   } = useProject();

//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
//   const [newProject, setNewProject] = useState({
//     name: '',
//     description: '',
//   });

//   const handleCreateProject = async () => {
//     try {
//       await createProject({
//         ...newProject,
//         environments: ['development', 'staging', 'production'],
//         settings: {
//           retention: 30,
//           maxSize: 5000000000, // 5GB
//           alertEnabled: true,
//         },
//       });
//       setIsCreateDialogOpen(false);
//       setNewProject({ name: '', description: '' });
//     } catch (error) {
//       console.error('Failed to create project:', error);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       {/* Header with Project Selector */}
//       <div className="flex justify-between items-center">
//         <div className="flex items-center gap-4">
//           <Select
//             value={currentProject?.id}
//             onValueChange={(value) => {
//               const project = projects.find((p) => p.id === value);
//               if (project) setCurrentProject(project);
//             }}
//           >
//             <SelectTrigger className="w-[300px]">
//               <SelectValue placeholder="Select a project" />
//             </SelectTrigger>
//             <SelectContent>
//               {projects.map((project) => (
//                 <SelectItem key={project.id} value={project.id}>
//                   {project.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select
//             value={currentEnvironment}
//             onValueChange={(value) => setCurrentEnvironment(value as Environment)}
//           >
//             <SelectTrigger className="w-[200px]">
//               <SelectValue placeholder="Select environment" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="development">Development</SelectItem>
//               <SelectItem value="staging">Staging</SelectItem>
//               <SelectItem value="production">Production</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Create Project
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Create New Project</DialogTitle>
//               <DialogDescription>
//                 Create a new project to start collecting and analyzing logs.
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4">
//               <div>
//                 <label className="text-sm font-medium">Project Name</label>
//                 <Input
//                   value={newProject.name}
//                   onChange={(e) =>
//                     setNewProject({ ...newProject, name: e.target.value })
//                   }
//                   placeholder="Enter project name"
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium">Description</label>
//                 <Textarea
//                   value={newProject.description}
//                   onChange={(e) =>
//                     setNewProject({ ...newProject, description: e.target.value })
//                   }
//                   placeholder="Enter project description"
//                 />
//               </div>
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleCreateProject}>Create Project</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {currentProject ? (
//         <>
//           {/* Project Overview */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Project Info</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="text-sm text-muted-foreground">Name</label>
//                     <p className="font-medium">{currentProject.name}</p>
//                   </div>
//                   <div>
//                     <label className="text-sm text-muted-foreground">Description</label>
//                     <p>{currentProject.description}</p>
//                   </div>
//                   <div>
//                     <label className="text-sm text-muted-foreground">Created</label>
//                     <p>{new Date(currentProject.createdAt).toLocaleDateString()}</p>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button variant="outline" size="sm">
//                       <Edit className="mr-2 h-4 w-4" />
//                       Edit
//                     </Button>
//                     <Button variant="outline" size="sm" className="text-destructive">
//                       <Trash className="mr-2 h-4 w-4" />
//                       Delete
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Environment Settings</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {currentProject.environments.map((env) => (
//                     <div
//                       key={env}
//                       className="flex items-center justify-between p-2 bg-muted rounded-lg"
//                     >
//                       <div className="flex items-center gap-2">
//                         <Box className="h-4 w-4" />
//                         <span className="capitalize">{env}</span>
//                       </div>
//                       <Badge variant="outline">Active</Badge>
//                     </div>
//                   ))}
//                   <Button variant="outline" className="w-full">
//                     <Settings className="mr-2 h-4 w-4" />
//                     Configure Environments
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Team</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="font-medium">Active Members</p>
//                       <p className="text-sm text-muted-foreground">
//                         {currentProject.team?.length || 1} members
//                       </p>
//                     </div>
//                     <Button variant="outline" size="sm">
//                       <Users className="mr-2 h-4 w-4" />
//                       Manage
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Project Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Log Volume</CardTitle>
//                 <CardDescription>Last 24 hours</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <Activity className="h-8 w-8 text-primary" />
//                     <div className="text-right">
//                       <p className="text-2xl font-bold">
//                         {currentProject.stats.totalLogs.toLocaleString()}
//                       </p>
//                       <p className="text-sm text-muted-foreground">Total Logs</p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Storage Used</CardTitle>
//                 <CardDescription>Total storage consumption</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <BarChart className="h-8 w-8 text-primary" />
//                     <div className="text-right">
//                       <p className="text-2xl font-bold">
//                         {(currentProject.stats.storageUsed / 1000000000).toFixed(2)} GB
//                       </p>
//                       <p className="text-sm text-muted-foreground">Used of 5 GB</p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Error Rate</CardTitle>
//                 <CardDescription>Current error percentage</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <AlertTriangle className="h-8 w-8 text-destructive" />
//                     <div className="text-right">
//                       <p className="text-2xl font-bold">2.3%</p>
//                       <p className="text-sm text-muted-foreground">Last hour</p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Quick Actions */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Quick Actions</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
//                   <Activity className="h-6 w-6 mb-2" />
//                   View Logs
//                 </Button>
//                 <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
//                   <Settings className="h-6 w-6 mb-2" />
//                   Configure
//                 </Button>
//                 <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
//                   <Users className="h-6 w-6 mb-2" />
//                   Invite Team
//                 </Button>
//                 <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
//                   <AlertTriangle className="h-6 w-6 mb-2" />
//                   Set Alerts
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </>
//       ) : (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center p-12">
//             <Box className="h-12 w-12 text-muted-foreground mb-4" />
//             <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
//             <p className="text-muted-foreground text-center mb-4">
//               Select an existing project or create a new one to get started.
//             </p>
//             <Button onClick={() => setIsCreateDialogOpen(true)}>
//               <Plus className="mr-2 h-4 w-4" />
//               Create Project
//             </Button>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default ProjectDashboard;

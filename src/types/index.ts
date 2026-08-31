import { UserRole, TaskPriority, TaskStatus } from "../constants/roles";
export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}
export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
export interface PaginationResult<T>{
    tasks:T[];
    pegination:{
        page:number;
        limit:number;
        total:number;
        totalPages:number
    }
}

export interface ApiResponse<T=any>{
    success:boolean,
    message:string,
    data?:T;
    errorCode?:string
    errors?:any
}
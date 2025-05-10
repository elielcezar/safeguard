import { useNavigate } from "react-router-dom"
import { PlusCircleIcon, LayoutDashboardIcon, UsersIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { UserCircleIcon, LogOutIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"


export function NavMain() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {    
    localStorage.removeItem('token');
    localStorage.removeItem('user');    
    navigate('/');
  };
  
  // Função para verificar se um caminho está ativo
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="mt-2">         

            <SidebarMenuItem className="flex items-center gap-2 mb-2">
              <SidebarMenuButton
                tooltip="Dashboard"
                asChild
                data-active={isActive("/home")}
                className="min-w-8 duration-300 ease-in-out rounded-md px-3 font-medium border-2 border-transparent
                  hover:border-2 hover:border-primary
                  data-[active=true]:bg-primary data-[active=true]:text-white                 
                  data-[active=true]:font-semibold data-[active=true]:pl-2"
              >
                <Link to="/home" className="flex items-center gap-3 group">
                  <LayoutDashboardIcon 
                    className={`text-primary ${isActive("/home") ? "text-white" : ""}`}
                  />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>            
            </SidebarMenuItem>

            <SidebarMenuItem className="flex items-center gap-2 mb-2">
              <SidebarMenuButton
                  tooltip="Nova Senha"
                  asChild                  
                  data-active={isActive("/pass/new")}
                  className="min-w-8 duration-300 ease-in-out rounded-md px-3 font-medium border-2 border-transparent
                    hover:border-2 hover:border-primary
                    data-[active=true]:bg-primary data-[active=true]:text-white                 
                    data-[active=true]:font-semibold data-[active=true]:pl-2"
                  >
                  <Link to="/pass/new" className="flex items-center gap-3 group">
                    <PlusCircleIcon className={`text-primary ${isActive("/pass/new") ? "text-white" : ""}`} />
                    <span>Nova Senha</span>
                  </Link>
              </SidebarMenuButton>            
            </SidebarMenuItem>

            <SidebarMenuItem className="flex items-center gap-2 mb-2">
              <SidebarMenuButton
                  tooltip="Novo Cliente"
                  asChild
                  data-active={isActive("/clients")}                 
                  className="min-w-8 duration-300 ease-in-out rounded-md px-3 font-medium border-2 border-transparent
                    hover:border-2 hover:border-primary
                    data-[active=true]:bg-primary data-[active=true]:text-white                 
                    data-[active=true]:font-semibold data-[active=true]:pl-2"
                  >
                  <Link to="/clients" className="flex items-center gap-3">              
                    <UsersIcon className={`text-primary ${isActive("/clients") ? "text-white" : ""}`} />
                    <span>Clientes</span>
                  </Link>
                </SidebarMenuButton>            
            </SidebarMenuItem>

            <SidebarMenuItem className="flex items-center gap-2 mb-2">
              <SidebarMenuButton
                  tooltip="Perfil"
                  asChild
                  data-active={isActive("/user/profile")}
                  className="min-w-8 duration-300 ease-in-out rounded-md px-3 font-medium border-2 border-transparent
                    hover:border-2 hover:border-primary
                    data-[active=true]:bg-primary data-[active=true]:text-white                 
                    data-[active=true]:font-semibold data-[active=true]:pl-2"
                  >
                  <Link to="/user/profile" className="flex items-center gap-3">              
                    <UserCircleIcon className={`text-primary ${isActive("/user/profile") ? "text-white" : ""}`} />
                    <span>Account</span>
                  </Link>
                </SidebarMenuButton>            
            </SidebarMenuItem>

            <SidebarMenuItem className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <SidebarMenuButton
                  tooltip="Sair"
                  asChild
                  className="min-w-8 ease-in-out rounded-md px-3 font-medium
                    hover:bg-destructive/10 hover:text-destructive
                    data-[active=true]:bg-black data-[active=true]:text-white"                 
                >                  
                  <Link to="#" onClick={handleLogout} className="flex items-center gap-3 group/logout">              
                    <LogOutIcon className="text-primary group-hover/logout:text-black" />
                    <span>Log out</span>
                  </Link>                  
                </SidebarMenuButton>            
            </SidebarMenuItem>

        </SidebarMenu>        
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
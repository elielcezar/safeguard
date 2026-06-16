import { NavMain } from "@/components/NavMain"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
  
export function AppSidebar({...props}) {
    
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">                
                <span className="text-base font-semibold">SafeGuard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent> 
        <SidebarGroup>                    
          <SidebarGroupContent>
            <NavMain />            
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        
      </SidebarFooter>

    </Sidebar>
  )
}
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function PageTitle({title}) {
    return (
        <div className="flex items-center mb-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>                
        </div>
    )
}

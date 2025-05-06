import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast, useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Create() {
    const navigate = useNavigate();
    const { dismiss } = useToast();
    const { id } = useParams(); // Obter id diretamente dos parâmetros da URL
    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState('');
    const [service, setService] = useState('');
    const [username, setUsername] = useState('');    
    const [password, setPassword] = useState('');
    const [extra, setExtra] = useState('');

    useEffect(() => {
        // Carregar os dados da senha para edição
        if (id) {
            fetchPasswordData();
        }
    }, [id]);

    async function fetchPasswordData() {
        try {
            const response = await api.get(`/password/${id}`);
            const data = response.data.password;
            
            setClient(data.client || '');
            setService(data.service || '');
            setUsername(data.username || '');
            setPassword(data.password || '');
            setExtra(data.extra || '');
        } catch (error) {
            console.error("Erro ao carregar dados da senha:", error);
            toast({
                variant: "destructive",
                title: "Erro ao carregar senha",
                description: "Não foi possível obter os dados da senha para edição.",
            });
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put(`/update-password/${id}`, {
                client,
                service,
                username,
                password,
                extra
            });
            
            // Mostrar toast de sucesso
            toast({
                title: "Senha atualizada com sucesso!",
                description: "Você será redirecionado para a página principal.",
            });
            
            // Redireciona para a página principal após o sucesso
            setTimeout(() => {
                navigate('/home');
                dismiss(); // Limpa todos os toasts depois de navegar
            }, 2000);
            
        } catch (error) {
            console.error("Erro ao salvar senha:", error);            
            // Mostrar toast de erro
            toast({
                variant: "destructive",
                title: "Erro ao salvar senha",
                description: error.response?.data?.message || "Ocorreu um erro ao processar sua solicitação.",
            });
            
            setLoading(false);
        }
    }
    
    return (
        <div className="min-h-screen">
      
            <SidebarProvider>

                <AppSidebar variant="inset"/>

                <main className="bg-white p-6 relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow">

                <h1 className="text-3xl font-bold text-gray-800">Editar Senha</h1>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label htmlFor="client" className="text-sm font-medium">Cliente</label>
                        <Input 
                            id="client" 
                            type="text" 
                            placeholder="Cliente" 
                            value={client} 
                            onChange={(e) => setClient(e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="service" className="text-sm font-medium">Serviço</label>
                        <Input 
                            id="service" 
                            type="text" 
                            placeholder="Serviço" 
                            value={service} 
                            onChange={(e) => setService(e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">Username</label>
                        <Input 
                            id="username" 
                            type="text" 
                            placeholder="Username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <Input 
                            id="password" 
                            type="text" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="extra" className="text-sm font-medium">Extra</label>
                        <Textarea 
                            id="extra" 
                            placeholder="Extra" 
                            value={extra} 
                            onChange={(e) => setExtra(e.target.value)}  
                        />
                       
                    </div>
                    
                    <Button type="submit" className="w-full bg-black text-white cursor-pointer hover:bg-gray-800" variant="default" disabled={loading}>
                      {loading ? "Salvando..." : "Salvar"}
                    </Button>
                </form>
                
                
                </main>

            </SidebarProvider>

            
        </div>
    )
}

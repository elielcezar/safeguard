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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Create() {
    const navigate = useNavigate();
    const { dismiss } = useToast();
    const [loading, setLoading] = useState(false);    
    
    const { id } = useParams(); // Obter id diretamente dos parâmetros da URL    
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [clientId, setClientId] = useState('');
    const [service, setService] = useState('');
    const [username, setUsername] = useState('');    
    const [password, setPassword] = useState('');
    const [extra, setExtra] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {  
        async function fetchClients() {            
            try {                
                const response = await api.get('api/clients');                
                setClients(response.data.clients || []);
            } catch (error) {
                console.error("Erro ao buscar clientes:", error);
                toast({
                    variant: "destructive",
                    title: "Erro ao carregar clientes",
                    description: "Não foi possível carregar a lista de clientes.",
                });
            } finally {
                setLoadingClients(false);
            }
        }        
        fetchClients();

        // Carregar os dados da senha para edição
        if (id) {
            fetchPasswordData();
        }
    }, [id]);

    async function fetchPasswordData() {
        try {
            const response = await api.get(`api/password/${id}`);
            const data = response.data.password;

            // Check if client data exists and has an id
            if (data.client && data.client.id) {                
                setClientId(data.client.id.toString());
            } else if (data.clientId) {                
                setClientId(data.clientId.toString());
            }
            
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
            await api.put(`api/update-password/${id}`, {
                clientId: clientId ? parseInt(clientId) : null,
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

    async function handleDelete() {
        setLoading(true);
        try {
            await api.delete(`api/delete-password/${id}`);
            
            toast({
                title: "Senha excluída com sucesso!",
                description: "Você será redirecionado para a página principal.",
            });
            
            setTimeout(() => {
                navigate('/home');
                dismiss();
            }, 2000);
            
        } catch (error) {
            console.error("Erro ao excluir senha:", error);
            toast({
                variant: "destructive",
                title: "Erro ao excluir senha",
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
                            <Select value={clientId} onValueChange={setClientId}>
                                <SelectTrigger className="w-full w-full bg-background border-input w-full border-input">
                                    <SelectValue placeholder="Selecione um cliente"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Clientes</SelectLabel>
                                        {loadingClients ? (
                                            <SelectItem value="loading" disabled>Carregando clientes...</SelectItem>
                                        ) : clients.length === 0 ? (
                                            <SelectItem value="empty" disabled>Nenhum cliente encontrado</SelectItem>
                                        ) : (
                                            clients
                                                .filter(client => client && client.id)
                                                .map(client => (
                                                    <SelectItem key={client.id} value={client.id.toString()}>
                                                        {client.name || `Cliente ${client.id}`}
                                                    </SelectItem>
                                                ))
                                        )}
                                    </SelectGroup>
                                    <div className="p-2 border-t">
                                        <Button 
                                            variant="link" 
                                            className="w-full justify-start p-2 text-sm" 
                                            onClick={() => navigate('/client/new')}
                                        >
                                            + Adicionar novo cliente
                                        </Button>
                                    </div>
                                </SelectContent>
                            </Select>
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
                        
                        <div className="flex gap-4 mt-4">
                            <Button type="submit" className="flex-1  text-white cursor-pointer hover:bg-gray-800" variant="default" disabled={loading}>
                                {loading ? "Salvando..." : "Salvar"}
                            </Button>
                            <Button 
                                type="button" 
                                className="flex-1 bg-red-600 text-white cursor-pointer hover:bg-red-700" 
                                variant="destructive" 
                                disabled={loading}
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Excluir
                            </Button>
                        </div>
                    </form>
                </main>
            </SidebarProvider>

            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir esta senha? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? "Excluindo..." : "Confirmar exclusão"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

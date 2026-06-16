import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import PageTitle from "@/components/PageTitle";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogClose,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

export default function Create() {
    const navigate = useNavigate();
    const { dismiss } = useToast();
    const [loading, setLoading] = useState(false);    
    
    const { id } = useParams();
    const [name, setName] = useState('');    
    const [showDeleteModal, setShowDeleteModal] = useState(false); 

    useEffect(() => {
        if (id) {
            fetchClientData();
        }
    }, [id]);
  
    async function fetchClientData() {        

        try {            
            const response = await api.get(`api/client/${id}`);
            const data = response.data.client;
            
            setName(data.name || '');           
            
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
            
            if (!id) {
                toast({
                    variant: "destructive",
                    title: "Erro ao salvar cliente",
                    description: "Não foi possível obter o ID do cliente.",
                });
                setLoading(false);
                return;
            }

            await api.put(`api/update-client/${id}`, {                
                name
            });
            
            // Mostrar toast de sucesso
            toast({
                title: "Cliente atualizado com sucesso!",
                description: "Você será redirecionado para a página principal.",
            });
            
            // Redireciona para a página principal após o sucesso
            setTimeout(() => {
                navigate('/clients');
                dismiss(); // Limpa todos os toasts depois de navegar
            }, 2000);
            
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);            
            // Mostrar toast de erro
            toast({
                variant: "destructive",
                title: "Erro ao salvar cliente",
                description: error.response?.data?.message || "Ocorreu um erro ao processar sua solicitação.",
            });
            
            setLoading(false);
        }
    }

    async function handleDelete() {
        setLoading(true);
        try {
            await api.delete(`api/delete-client/${id}`);
            
            toast({
                title: "Cliente excluído com sucesso!",
                description: "Você será redirecionado para a página principal.",
            });
            
            setTimeout(() => {
                navigate('/clients');
                dismiss();
            }, 2000);
            
        } catch (error) {
            console.error("Erro ao excluir cliente:", error);
            toast({
                variant: "destructive",
                title: "Erro ao excluir cliente",
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
                    
                    <PageTitle title="Editar Cliente"/>

                    <form onSubmit={handleSubmit}>                        
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Nome</label>
                            <Input 
                                id="name" 
                                type="text" 
                                placeholder="Nome" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
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

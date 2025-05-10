import React, { useState, useEffect } from 'react'
import api from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Pencil } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent  
} from "@/components/ui/card";
import {
    Table,
    TableBody,    
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";

export default function NewClient() {
    const navigate = useNavigate();    
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [clients, setClients] = useState([]);

    useEffect(() => {           
        fetchClients();        
    }, []);

    const fetchClients = async () => {
        const response = await api.get('/api/clients');
        setClients(response.data.clients);          
    }     

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/clients', { name });
            setName(''); // Limpa o campo após criar

            toast({
                title: 'Cliente criado com sucesso',
                description: 'O cliente foi criado com sucesso',
            });
            
            // Atualiza a lista de clientes
            await fetchClients();
            
        } catch (error) {
            toast({
                title: 'Erro ao criar cliente',
                description: 'Ocorreu um erro ao criar o cliente',
            });
        } finally {
            setLoading(false);
        }
    }
    
  return (
    <div className="min-h-screen">
        <SidebarProvider>
            <AppSidebar variant="inset"/>

            <main className="flex w-full flex-1 gap-5 p-6 flex-col">

                <PageTitle title="Clientes"/>
                
             
                <Card className="mb-6">                   
                    <CardContent>                        
                        <form onSubmit={handleSubmit} className="space-y-2 flex mb-7 mt-2">
                            <div className="space-y-2 flex-4/5">
                                <label htmlFor="name" className="text-sm font-medium hidden">Nome</label>
                                <Input 
                                    id="name" 
                                    type="text" 
                                    placeholder="Nome" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="flex-1/5 ml-5">
                                {loading ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </form>                        
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-lg text-muted-foreground">Carregando clientes...</span>
                        </div>
                    ) : clients.length > 0 ? (
                        <>          
                            <h2>Clientes</h2>              
                            <Table>                         
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Id</TableHead>
                                        <TableHead>Cliente</TableHead>                                                       
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clients.map((client) => (                                    
                                        <TableRow key={client.id}>
                                            <TableCell className="font-medium">
                                                {client.id}
                                            </TableCell>
                                            <TableCell>
                                                {client.name}
                                                </TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-2">                                                                                                                        
                                                    <Button
                                                    onClick={() => navigate(`/client/edit/${client.id}`)}
                                                    className="h-6 w-6"
                                                    title="Editar cliente"
                                                    >
                                                    <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </span>
                                            </TableCell>                            
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>                      
                        </>
                    ) : (
                        <div className="text-center py-8">
                        <p className="text-muted-foreground text-lg">Nenhuma senha encontrada.</p>
                        <Button 
                            className="mt-4"
                            onClick={() => navigate('/pass/new')}
                        >
                            Adicionar nova senha
                        </Button>
                        </div>
                    )}
                    </CardContent>
                </Card>              
            </main>
        </SidebarProvider>
    </div>
  )
}


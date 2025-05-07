import React, { useState } from 'react'
import api from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast, useToast } from "@/components/ui/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewClient() {
    const navigate = useNavigate();
    const { dismiss } = useToast();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/clients', { name });

            toast({
                title: 'Cliente criado com sucesso',
                description: 'O cliente foi criado com sucesso',
            });
            setTimeout(() => {
                navigate('/');
                dismiss();
            }, 2000);
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

            <main className="flex w-full flex-1 gap-5 p-6">
                <Card className="mb-6 flex-3/5 bg-white p-6 relative md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow border-none">
                    <CardHeader>
                        <CardTitle>Novo Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </SidebarProvider>
    </div>
  )
}


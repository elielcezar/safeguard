import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast, useToast } from "@/components/ui/use-toast";
import api from '@/services/api';
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


export default function Profile() {
  
  const navigate = useNavigate();
  const { dismiss } = useToast();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');    
  
  // Busca os dados do usuário do localStorage
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);        
        setName(user.name || '');
        setEmail(user.email || '');
        setPassword(user.password || '');
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
      }
    }        
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    console.log(name, email, password);

    try {
      await api.put('/api/users', { name, email, password });
      toast({
        title: 'Usuário atualizado com sucesso',
        description: 'O usuário foi atualizado com sucesso',
      });
      setTimeout(() => {
        navigate('/');
        dismiss();  
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: 'Erro ao atualizar usuário',
        description: 'Ocorreu um erro ao atualizar o usuário',
      });
      console.error('Erro ao atualizar usuário:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
            <SidebarProvider>

                <AppSidebar variant="inset"/>

                <main className="flex w-full flex-1 gap-5 p-6 flex-col">

                  <h1>Profile</h1>

                  <Card className="mb-6">
                      <CardHeader>
                        <CardDescription>
                          Informações da sua conta
                        </CardDescription>
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
                          <div className="space-y-2">
                              <label htmlFor="email" className="text-sm font-medium">Email</label>
                              <Input 
                                  id="email" 
                                  type="text" 
                                  placeholder="Email" 
                                  value={email} 
                                  onChange={(e) => setEmail(e.target.value)} 
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
                         
                          
                          <div className="flex gap-4 mt-4">
                              <Button type="submit" className="flex-1  text-white cursor-pointer hover:bg-gray-800" variant="default" disabled={loading}>
                                  {loading ? "Salvando..." : "Salvar"}
                              </Button>
                             
                          </div>
                      </form>
                      </CardContent>
                    </Card>
                </main>
            </SidebarProvider>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast, useToast } from "@/components/ui/use-toast";
import PageTitle from "@/components/PageTitle";
import {
  Card,
  CardContent, 
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CopyIcon, CheckIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogClose,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

export default function Create() {
    const navigate = useNavigate();
    const { dismiss } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingClients, setLoadingClients] = useState(true);
    
    const [clientId, setClientId] = useState('');
    const [clients, setClients] = useState([]);
    const [service, setService] = useState('');
    const [username, setUsername] = useState('');    
    const [password, setPassword] = useState('');
    const [extra, setExtra] = useState('');

    // Estados para o gerador de senhas
    const [passwordLength, setPasswordLength] = useState(12);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [generatedPassword, setGeneratedPassword] = useState('');    
    const [copied, setCopied] = useState(false);

    // Buscar a lista de clientes ao carregar o componente
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
    }, []);

    // Função para gerar senha aleatória
    const generatePassword = () => {
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        
        let characters = "";
        if (includeUppercase) characters += uppercase;
        if (includeLowercase) characters += lowercase;
        if (includeNumbers) characters += numbers;
        if (includeSymbols) characters += symbols;
        
        // Se nenhuma opção for selecionada, usa pelo menos letras minúsculas
        if (!characters) {
            characters = lowercase;
            setIncludeLowercase(true);
        }
        
        let generated = "";
        for (let i = 0; i < passwordLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            generated += characters.charAt(randomIndex);
        }

        setGeneratedPassword(generated);
    };

    // Função para copiar a senha gerada para a área de transferência
    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPassword);
        setCopied(true);
        
        toast({
            title: "Senha copiada!",
            description: "A senha foi copiada para a área de transferência.",
        });
        
        // Resetar o ícone de copiado após 2 segundos
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    // Função para usar a senha gerada no formulário
    const useGeneratedPassword = () => {
        setPassword(generatedPassword);       
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {           
            await api.post('api/new-password', {
                clientId: parseInt(clientId),
                service,
                username,
                password,
                extra
            });
            
            // Mostrar toast de sucesso
            toast({
                title: "Senha salva com sucesso!",
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

                <main className="w-full p-6">

                <PageTitle title="Nova Senha"/>

                <Card className="mb-6 flex-3/5 bg-white p-6 relative md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow border-none">                   
                    <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="client" className="text-sm font-medium hidden">Cliente</label>
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
                        <div className="space-y-2 my-5">
                            <label htmlFor="service" className="text-sm font-medium hidden">Serviço</label>
                            <Input 
                                id="service" 
                                type="text" 
                                placeholder="Serviço" 
                                value={service} 
                                onChange={(e) => setService(e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2 my-5">
                            <label htmlFor="username" className="text-sm font-medium hidden">Username</label>
                            <Input 
                                id="username" 
                                type="text" 
                                placeholder="Username" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2 my-5 flex items-center">
                            <label htmlFor="password" className="text-sm font-medium hidden">Password</label>
                            <Input 
                                id="password" 
                                type="text" 
                                placeholder="Password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="flex-2/3"
                            />
                            <Dialog className="ml-2 flex-1/3">
                                <DialogTrigger>
                                    <span className="p-2 rounded-md bg-primary text-white p-1 ml-5 cursor-pointer">Gerar Senha</span>
                                </DialogTrigger>      
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Gerador de Senhas</DialogTitle>                        
                                    </DialogHeader>
                                    {/* Campo para exibir a senha gerada */}
                                    <div className="space-y-2">
                                        <label htmlFor="generatedPassword" className="text-sm font-medium">Senha Gerada</label>
                                        <div className="flex">
                                            <div className="relative flex-grow">
                                                <Input 
                                                    id="generatedPassword" 
                                                    type="text" 
                                                    value={generatedPassword} 
                                                    readOnly 
                                                    placeholder="A senha gerada aparecerá aqui"
                                                    className="pr-10" 
                                                />                                    
                                                <button 
                                                    type="button" 
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1" 
                                                    onClick={copyToClipboard}
                                                    disabled={!generatedPassword}
                                                >
                                                    {copied ? (
                                                        <CheckIcon className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <CopyIcon className="h-4 w-4 text-gray-500" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <Label>Tamanho da senha: {passwordLength}</Label>
                                        </div>
                                        <Slider 
                                            value={[passwordLength]} 
                                            min={4} 
                                            max={32} 
                                            step={1} 
                                            onValueChange={(value) => setPasswordLength(value[0])} 
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch 
                                                id="uppercase" 
                                                checked={includeUppercase} 
                                                onCheckedChange={setIncludeUppercase} 
                                            />
                                            <Label htmlFor="uppercase">Letras maiúsculas (A-Z)</Label>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <Switch 
                                                id="lowercase" 
                                                checked={includeLowercase} 
                                                onCheckedChange={setIncludeLowercase} 
                                            />
                                            <Label htmlFor="lowercase">Letras minúsculas (a-z)</Label>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <Switch 
                                                id="numbers" 
                                                checked={includeNumbers} 
                                                onCheckedChange={setIncludeNumbers} 
                                            />
                                            <Label htmlFor="numbers">Números (0-9)</Label>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <Switch 
                                                id="symbols" 
                                                checked={includeSymbols} 
                                                onCheckedChange={setIncludeSymbols} 
                                            />
                                            <Label htmlFor="symbols">Símbolos (!@#$)</Label>
                                        </div>

                                        <Button onClick={generatePassword} className="w-full">
                                            Gerar Senha Aleatória
                                        </Button>
                                        <DialogClose asChild>
                                            <Button 
                                                onClick={useGeneratedPassword}                             
                                                className="w-full" 
                                                disabled={!generatedPassword}
                                                 variant="outline"
                                            >
                                                Usar Esta Senha
                                            </Button>
                                        </DialogClose>
                                    </div>
                                </DialogContent>                     
                            </Dialog>
                        </div>
                        
                        <div className="space-y-2">
                            <label htmlFor="extra" className="text-sm font-medium hidden">Extra</label>
                            <Textarea 
                                id="extra" 
                                placeholder="Extra" 
                                value={extra} 
                                onChange={(e) => setExtra(e.target.value)}  
                            />
                        
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full mt-6 "                          
                          disabled={loading}                          
                        >
                          {loading ? "Salvando..." : "Salvar"}
                        </Button>
                    </form>
                    </CardContent>
                </Card>    

                <Dialog>                    
                    
                </Dialog>                 
                
                </main>

            </SidebarProvider>

            
        </div>
    )
}

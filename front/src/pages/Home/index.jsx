import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import api from '@/services/api';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, EyeOff, Copy, Loader2, Search } from "lucide-react";

export default function Home({ children }) {
  //const [userData, setUserData] = useState({});
  const [passwords, setPasswords] = useState([]);
  const [filteredPasswords, setFilteredPasswords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const navigate = useNavigate();

  // Busca os dados do usuário do localStorage
  useEffect(() => {
    //const user = JSON.parse(localStorage.getItem('user'));
    //if (user) {
    //  setUserData(user);
    //}    
    // Buscar a lista de senhas
    fetchPasswords();
  }, []);

  // Filtra as senhas quando a busca ou a lista de senhas mudar
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPasswords(passwords);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = passwords.filter(password => 
      (password.client && password.client.toLowerCase().includes(query)) ||
      (password.service && password.service.toLowerCase().includes(query)) ||
      (password.username && password.username.toLowerCase().includes(query))
    );
    
    setFilteredPasswords(filtered);
  }, [searchQuery, passwords]);
  
  // Função para buscar as senhas
  const fetchPasswords = async () => {
    try {
      setLoading(true);
      setError(null); // Limpa erros anteriores
      const response = await api.get('/list-passwords');
      
      console.log('Resposta da API:', response.data);
      
      // Obtenha o array de senhas da resposta (pode estar em .passwords ou diretamente em .data)
      let passwordsData = [];
      
      if (response.data && typeof response.data === 'object') {
        passwordsData = response.data.passwords;
      }
      setPasswords(passwordsData);
      setFilteredPasswords(passwordsData);
      
    } catch (error) {
      console.error("Erro ao buscar senhas:", error);
      
      // Extrair informações detalhadas do erro
      const statusCode = error.response?.status;
      const statusText = error.response?.statusText;
      const errorMessage = error.response?.data?.message || error.message;
      
      // Mensagem mais informativa
      const errorDetails = statusCode 
        ? `Erro ${statusCode} (${statusText}): ${errorMessage}` 
        : `Erro: ${errorMessage}`;
      
      console.error("Detalhes do erro:", errorDetails);
      
      // Armazena o erro no estado
      setError(errorDetails);
      
      toast({
        variant: "destructive",
        title: "Erro ao carregar senhas",
        description: `${errorDetails}. Tente novamente mais tarde.`,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para copiar senha para o clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Senha copiada",
          description: "A senha foi copiada para a área de transferência.",
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Erro ao copiar senha",
          description: "Não foi possível copiar a senha.",
        });
      });
  };

  // Função para alternar visibilidade da senha
  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleLogout = () => {    
    localStorage.removeItem('token');
    localStorage.removeItem('user');    
    navigate('/');
  };

  // Função para lidar com a mudança na busca
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen">
      
        <SidebarProvider>

          <AppSidebar variant="inset"/>
          
          <main className="bg-white p-6 relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow">
            
              <div className="flex items-center mb-6">
                <SidebarTrigger className="mr-4" />
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <Button variant="outline" onClick={handleLogout} className="ml-auto">
                  Sair
                </Button>
              </div>
                
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Senhas Salvas</span>                   
                  </CardTitle>                 
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2 text-lg text-muted-foreground">Carregando senhas...</span>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="text-red-500 mb-2 text-lg">
                        Ocorreu um erro ao carregar as senhas
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {error}
                      </p>                     
                    </div>
                  ) : passwords.length > 0 ? (
                    <>
                      <div className="relative mb-4">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          placeholder="Buscar por cliente, serviço ou usuário..." 
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="pl-8"
                        />                       
                      </div>
                      
                      {filteredPasswords.length > 0 ? (
                        <Table>                         
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Serviço</TableHead>
                              <TableHead>Usuário</TableHead>
                              <TableHead>Senha</TableHead>                          
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredPasswords.map((password) => (
                              <TableRow key={password.id}>
                                <TableCell className="font-medium">{password.client}</TableCell>
                                <TableCell>{password.service}</TableCell>
                                <TableCell>{password.username}</TableCell>
                                <TableCell>
                                  <span className="flex items-center gap-2">
                                    <span className="font-mono">
                                      {visiblePasswords[password.id] ? password.password : '••••••••'}
                                    </span>
                                    <Button                                      
                                      onClick={() => copyToClipboard(password.password)}
                                      className="h-6 w-6"
                                      title="Copiar senha"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      onClick={() => togglePasswordVisibility(password.id)}
                                      className="h-6 w-6"
                                      title={visiblePasswords[password.id] ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                      {visiblePasswords[password.id] ? 
                                        <EyeOff className="h-4 w-4" /> : 
                                        <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                      onClick={() => navigate(`/pass/edit/${password.id}`)}
                                      className="h-6 w-6"
                                      title="Editar senha"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </span>
                                </TableCell>                            
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground text-lg">Nenhuma senha encontrada para "{searchQuery}".</p>
                          <Button 
                            className="mt-4"
                            onClick={() => setSearchQuery("")}
                          >
                            Limpar Busca
                          </Button>
                        </div>
                      )}
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
              
              {children}
          </main>          
        </SidebarProvider>
      
    </div>
  );
}
    

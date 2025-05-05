import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

// Importando componentes do shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');  
    
    useEffect(() => {
      if (localStorage.getItem('token')) {
        navigate('/home');
      }
    }, []);
  
    async function handleLogin(e) {
      e.preventDefault();      
      setLoading(true);
      setError('');
      
      try {
          const response = await api.post('/login', {
              email,
              password
          });

          if (response.status === 200) {              
              localStorage.setItem('token', response.data.token);              
              localStorage.setItem('user', JSON.stringify(response.data.user));              
              navigate('/home');
          }
      } catch (error) {
          if (error.response.status === 500) {
            setError('Erro no servidor. Por favor, tente novamente mais tarde.');
          } else {
            setError(error.response.data.message);
          }
      } finally {
          setLoading(false);
      }
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Acesso ao Sistema</CardTitle>          
          <CardDescription className="text-center">
            Digite suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md flex justify-between items-center" role="alert">
                <span>{error}</span>                
              </div>
            )}
            
            <Button type="submit" className="w-full bg-black text-white cursor-pointer hover:bg-gray-800" variant="default" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-gray-500">
          Sistema de Gerenciamento Seguro
        </CardFooter>

      </Card>
    </div>
  );
};



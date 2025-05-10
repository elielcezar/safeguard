import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(600); // 10 minutos em segundos
  
  // Dados do login recebidos via estado da rota
  const { tempToken } = location.state || {};
  
  useEffect(() => {
    // Verificar se temos o token temporário
    if (!tempToken) {
      navigate('/login');
    }
    
    // Iniciar contagem regressiva
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirecionar para login quando expirar
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [tempToken, navigate]);
  
  // Formatar a contagem regressiva como mm:ss
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handler para verificar o código
  async function handleVerifyCode(e) {
    e.preventDefault();
    
    if (!code) {
      setError('Por favor, digite o código de verificação');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('api/verify-2fa', {
        tempToken,
        code
      });
      
      if (response.status === 200) {
        // Login completo, salvar token e redirecionar
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
          <CardTitle className="text-2xl font-bold text-center">Verificação em Duas Etapas</CardTitle>
          <CardDescription className="text-center">
            Digite o código de verificação enviado para seu WhatsApp
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Código de Verificação
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Digite o código de 6 dígitos"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                O código expira em: <span className="font-medium">{formatCountdown()}</span>
              </p>
            </div>
            
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md flex justify-between items-center" role="alert">
                <span>{error}</span>
              </div>
            )}
            
            <Button type="submit" className="w-full text-white cursor-pointer hover:bg-gray-800" variant="default" disabled={loading}>
              {loading ? "Verificando..." : "Verificar Código"}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm text-gray-500"
                onClick={() => navigate('/login')}
              >
                Voltar para o login
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-gray-500">
          Verificação de segurança adicional
        </CardFooter>
      </Card>
    </div>
  );
} 
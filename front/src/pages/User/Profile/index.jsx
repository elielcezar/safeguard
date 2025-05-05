import React, { useState, useEffect } from 'react';

export default function Profile() {

  const [userData, setUserData] = useState({});

    // Busca os dados do usuário do localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserData(user);
    }    
    // Buscar a lista de senhas
    fetchPasswords();
  }, []);

  return (
    <div>
      <h1>Profile</h1>
      <Card className="mb-6">
                <CardHeader>
                  <CardDescription>
                    Informações da sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-gray-500">Nome</span>
                      <span className="font-medium text-lg">{userData.name}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-gray-500">Email</span>
                      <span className="font-medium">{userData.email}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-gray-500">Função</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {userData.role}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
    </div>
  );
}

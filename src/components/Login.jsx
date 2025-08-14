import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn } from 'lucide-react';
import '../App.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = login(username, password);
        
        if (!success) {
            setError('Usuário ou senha inválidos.');
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary rounded-full">
                            <LogIn className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Sistema de Gestão</CardTitle>
                    <CardDescription>
                        Entre com suas credenciais para acessar o sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Usuário</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Digite seu usuário"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p className="mb-2">Credenciais de teste:</p>
                        <p><strong>Admin:</strong> admin / admin</p>
                        <p><strong>Vendedor:</strong> vendedor1 / 123</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


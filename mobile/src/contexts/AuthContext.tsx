//Contexto compartilhar informação se o usuario ta logado ou nao
//Centralizar alguma logica para compartilhar com qualquer lugar da aplicação
//Aplicação sempre tem acesso ao contexto atulizado
import { createContext, ReactNode, useState, useEffect } from "react";
import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { api } from '../services/api'

WebBrowser.maybeCompleteAuthSession();

interface UsersProps {
    name: string;
    avatarUrl: string;
}

export interface AuthContextDataProps {
    user: UsersProps;
    isUserLoading: boolean;
    signIn: () => Promise<void>;//metodo que vai fazer o processo de autenticação
}

interface AuthProviderProps{
    children: ReactNode
}

export const AuthContext = createContext({} as AuthContextDataProps);//objetivo armazenar o conteudo do contexto

export function AuthContextProvider({ children }: AuthProviderProps) { //permitir compartilhar o contexto com toda aplicação
    const [user, setUser] = useState<UsersProps>({} as UsersProps);
    const [isUserLoading, setIsUserLoading] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({ 
        clientId: '725741249317-qr0e87rbaqk1ccudm80uegdecr5m56cf.apps.googleusercontent.com',
        redirectUri: AuthSession.makeRedirectUri({ useProxy: true}),
        scopes: ['profile','email']
    })

    async function signIn() {
        try {
            setIsUserLoading(true);

            await promptAsync();
            
        } catch (error) {
            console.log(error)
            throw error;
        }

        finally{
            setIsUserLoading(false);
        }   
    }

    async function signInWithGoogle(access_token: string) {

        try {
            setIsUserLoading(true);

            const tokenResponse = await api.post('/users', {access_token})
            api.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.token}`;

            const userInfoResponse = await api.get('/me');
            setUser(userInfoResponse.data.user);
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setIsUserLoading(false);
        }
    }

    useEffect(() => { //hook do react //executa alguma function assim que o componente e renderizado
        if(response?.type === 'success' && response.authentication?.accessToken){
            signInWithGoogle(response.authentication.accessToken);
        }
    },[response]); //quando esse conteudo e atualizado o useEffect tbm e atualizado

    return (
        <AuthContext.Provider value={{
            signIn,
            isUserLoading,
            user
        }}>
            {children}
        </AuthContext.Provider>
    )
}
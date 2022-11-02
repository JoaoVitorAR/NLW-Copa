//usa o Hook para nao ter q chamar o contexto todo momento, chama somente a funcao useAuth que retorna o contexto
import { useContext } from "react";

import { AuthContext, AuthContextDataProps } from "../contexts/AuthContext";

export function useAuth(): AuthContextDataProps {
    const context = useContext(AuthContext);

    return context;
}
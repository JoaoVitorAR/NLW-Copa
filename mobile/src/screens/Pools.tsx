import { useState, useCallback } from "react";
import { VStack, Icon, useToast, FlatList} from "native-base";
import { Octicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'

import { api } from "../services/api";
import { Header } from "../components/Header";
import { Button } from "../components/Button";
import { PoolCard, PoolCardProps } from "../components/PoolCard";
import { Loading } from "../components/Loading";
import { EmptyPoolList } from "../components/EmptyPoolList";

export function Pools() {
    const [isLoading, setIsLoading] = useState(true);
    const [pools, setPools] = useState<PoolCardProps[]>([]);
    const { navigate } = useNavigation();
    const toast = useToast();

    async function fetchPools() {
        try {
            setIsLoading(true);

            const response = await api.get('/pools')
            setPools(response.data.pools)

        } catch (error) {
            console.log(error)

            toast.show({
                title: 'Não foi possivel carregar os bolões.',
                placement: 'top',
                bgColor: 'red.500'
            });

        } finally {
            setIsLoading(false)
        }
    }

    //rederiza a pagina sem q clicar no botao
    useFocusEffect(useCallback(() => {
        fetchPools();
    }, []));

    return (
        <VStack flex={1} bgColor="gray.900">
            <Header title="Meus bolões"/>

            <VStack mt={6} mx={5} alignItems="center" borderBottomWidth={1} borderBottomColor="gray.600" pb={4} mb={4}>
                <Button 
                    title="BUSCAR BOLÃO POR CÓDIGO" 
                    leftIcon={<Icon as={Octicons} name="search" color="balck" size="md" />}
                    onPress={() => navigate('find')}
                /> 
            </VStack>
            
           {
            isLoading ? <Loading /> :
                <FlatList 
                    data={pools}
                    keyExtractor={item => item.id}
                    //desestruturando item e passando cada item para ser renderizado no poolCard
                    renderItem={({ item }) => (
                        <PoolCard 
                            data={item}
                            onPress={() => navigate('details', {id: item.id})}
                        />    
                    )} 
                    ListEmptyComponent={() => <EmptyPoolList />}
                    showsVerticalScrollIndicator={false}
                    _contentContainerStyle={{ pb:10 }}
                    px={5}
                />
            }
        </VStack>
    )
}
import {
  Box,
  Button,
  FormLabel,
  Heading,
  HStack,
  Input,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spinner,
  Switch,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  connectButtonPressed,
  disconnectButtonPressed,
  sendMessage,
  setOnConnect,
  setOnDisconnect,
} from './conexion/esp32';
import './styles.css';

function App() {
  const [isConectado, setConectado] = useState(false);
  const [isProcesando, setProcesando] = useState(false);
  const toast = useToast();

  setOnConnect(() => {
    setProcesando(false);
    setConectado(true);
    toast({
      title: 'display conectado',
      status: 'success',
      duration: 1000,
      isClosable: false,
      variant: 'subtle',
    });
  });

  setOnDisconnect(() => {
    setProcesando(false);
    setConectado(false);
    toast({
      title: 'display desconectado',
      status: 'error',
      duration: 1000,
      isClosable: false,
      variant: 'subtle',
    });
  });

  function handleConexion() {
    setProcesando(true);
    if (isConectado) {
      disconnectButtonPressed();
    } else {
      connectButtonPressed();
    }
  }

  return (
    <Box p="10" pt="0" pb="16" h="100svh">
      <VStack alignItems="start" h="100%">
        <Box h="10" position="relative" w="100%">
          {isProcesando && (
            <Spinner
              color="yellow.500"
              size="sm"
              position="absolute"
              top="60%"
              right="0"
            />
          )}

          <Box
            w="2"
            h="2"
            bg={isConectado ? 'green.500' : 'red.500'}
            position="absolute"
            top="70%"
            right="1"
            borderRadius="100%"
          ></Box>
        </Box>
        <Heading as="h2" size="xl" mb="10">
          {isConectado ? 'Conectado' : 'Listo para conectar'}
        </Heading>
        {!isConectado && (
          <>
            <Text flex="1" pt="4">
              Para conectarte al esp-32 da clic en el boton
            </Text>
          </>
        )}
        {isConectado && (
          <VStack alignItems="start" w="100%" flex="1" spacing="6">
            <Box w="100%">
              <FormLabel htmlFor="texto">Texto</FormLabel>
              <Input
                id="texto"
                disabled={!isConectado}
                onChange={(e) => {
                  sendMessage(e.target.value);
                }}
              ></Input>
            </Box>
            <HStack>
              <Switch
                disabled={!isConectado}
                colorScheme="teal"
                size="lg"
                onChange={() => {
                  sendMessage('|Marquee');
                }}
                id="marquee"
              />
              <FormLabel htmlFor="marquee" mb="0">
                Marquee
              </FormLabel>
            </HStack>
            <HStack>
              <Switch
                disabled={!isConectado}
                colorScheme="teal"
                size="lg"
                onChange={() => {
                  sendMessage('|Invertir');
                }}
                id="invertir"
              />
              <FormLabel htmlFor="invertir" mb="0">
                Invertir
              </FormLabel>
            </HStack>
            <Box w="100%">
              <FormLabel htmlFor="brillo">Brillo</FormLabel>
              <Slider
                disabled={!isConectado}
                colorScheme="teal"
                id="brillo"
                aria-label="brillo"
                defaultValue={0}
                min={0}
                max={15}
                size="lg"
                onChangeEnd={(value) => {
                  console.log(`|Brillo|${value}`);
                  sendMessage(`|Brillo|${value}`);
                }}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize="6" />
              </Slider>
            </Box>
          </VStack>
        )}
        <Button size="lg" w="100%" colorScheme="teal" onClick={handleConexion}>
          {isConectado ? 'desconectar' : 'conectar'}
        </Button>
      </VStack>
    </Box>
  );
}

export default App;

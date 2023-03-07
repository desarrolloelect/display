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
  Switch,
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
  const toast = useToast();

  setOnConnect(() => {
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
    if (isConectado) {
      disconnectButtonPressed();
    } else {
      connectButtonPressed();
    }
  }

  return (
    <Box p="10" h="100svh">
      <VStack alignItems="start" h="100%">
        <Heading as="h2" size="xl" mb="10">
          {isConectado ? 'Conectado' : 'Listo para conectar'}
        </Heading>
        <VStack alignItems="start" w="100%" flex="1" spacing="6">
          <Box w="100%">
            <FormLabel htmlFor="texto">Texto</FormLabel>
            <Input
              id="texto"
              onChange={(e) => {
                sendMessage(e.target.value);
              }}
            ></Input>
          </Box>
          <HStack>
            <FormLabel htmlFor="marquee" mb="0">
              Marquee
            </FormLabel>
            <Switch
              colorScheme="teal"
              onChange={() => {
                sendMessage('|Marquee');
              }}
              id="marquee"
            />
          </HStack>
          <HStack>
            <FormLabel htmlFor="invertir" mb="0">
              Invertir
            </FormLabel>
            <Switch
              colorScheme="teal"
              onChange={() => {
                sendMessage('|Invertir');
              }}
              id="invertir"
            />
          </HStack>
          <Box w="100%">
            <FormLabel htmlFor="brillo">Brillo</FormLabel>
            <Slider
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
        <Button size="lg" w="100%" colorScheme="teal" onClick={handleConexion}>
          {isConectado ? 'desconectar' : 'conectar'}
        </Button>
      </VStack>
    </Box>
  );
}

export default App;

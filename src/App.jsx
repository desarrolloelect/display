import { RepeatIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  FormLabel,
  Heading,
  HStack,
  IconButton,
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
import { useCallback, useState } from 'react';
import {
  connectButtonPressed,
  disconnectButtonPressed,
  sendMessage,
  setOnConnect,
  setOnDisconnect,
  setOnError,
} from './conexion/esp32';
import './styles.css';

const debounce = (func, wait) => {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

function App() {
  const [isEsperandoClick, setEsperandoClick] = useState(true);
  const [isConectado, setConectado] = useState(false);
  const [isProcesando, setProcesando] = useState(false);
  const [isConfigurando, setConfigurando] = useState(false);
  const [isMarquee, setMarquee] = useState(false);
  const toast = useToast();

  const handleMensaje = useCallback(
    debounce((inputVal) => sendMessage(inputVal), 200),
    []
  );

  const setSizeGrande = (isGrande) => {
    setConfigurando(false);
    setConectado(true);
    sendMessage(isGrande ? '|tamanoGrande' : '|tamanoChico');
  };

  setOnConnect(() => {
    setEsperandoClick(false);
    setProcesando(false);
    setConfigurando(true);
    toast({
      title: 'display conectado',
      status: 'success',
      duration: 1000,
      isClosable: false,
      variant: 'subtle',
    });
  });

  setOnError(() => {
    setProcesando(false);
    toast({
      title: 'erorr',
      status: 'error',
      duration: 1000,
      isClosable: false,
      variant: 'subtle',
    });
  });

  setOnDisconnect(() => {
    setConectado(false);
    setConfigurando(false);
    setEsperandoClick(true);
    setProcesando(false);
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
        <Heading w="100%" as="h2" size="xl" mb="10">
          {isEsperandoClick && (
            <>
              <>Listo para </>
              <Box
                display="inline-block"
                color="teal.600"
                onClick={handleConexion}
              >
                conectar
              </Box>
            </>
          )}
          {isConfigurando && 'Selecciona el tamaño'}
          {isConectado && (
            <HStack w="100%">
              <Box flex="1">Conectado </Box>
              <IconButton
                color="teal.600"
                icon={<RepeatIcon />}
                onClick={() => {
                  sendMessage('|Reiniciar');
                }}
              />
            </HStack>
          )}
        </Heading>

        {isEsperandoClick && (
          <VStack flex="1">
            <Text pt="4">Para conectarte al esp-32 da clic en el boton</Text>
            {isProcesando && <Spinner color="teal.500" size="xl" />}
          </VStack>
        )}
        {isConfigurando && (
          <VStack pt="6" w="100%" spacing="6">
            <Button
              size="lg"
              w="100%"
              colorScheme="teal"
              onClick={() => {
                setSizeGrande(false);
              }}
            >
              32 x 8
            </Button>
            <Button
              size="lg"
              w="100%"
              colorScheme="teal"
              onClick={() => {
                setSizeGrande(true);
              }}
            >
              32 x 16
            </Button>
          </VStack>
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
                  handleMensaje(e.target.value);
                }}
              ></Input>
            </Box>
            <HStack>
              <Switch
                disabled={!isConectado}
                colorScheme="teal"
                size="lg"
                onChange={(e) => {
                  setMarquee(e.target.checked);
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
                onChangeEnd={(e) => {
                  sendMessage(`|Brillo|${e}`);
                }}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize="6" />
              </Slider>
            </Box>
            {isMarquee && (
              <Box w="100%">
                <FormLabel htmlFor="velocidad">Velocidad</FormLabel>
                <Slider
                  colorScheme="teal"
                  id="velocidad"
                  aria-label="velocidad"
                  defaultValue={40}
                  min={0}
                  max={50}
                  size="lg"
                  onChangeEnd={(value) => {
                    sendMessage(`|Velocidad|${70 - value}`);
                  }}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize="6" />
                </Slider>
              </Box>
            )}
          </VStack>
        )}
        {!isConfigurando && (
          <Button
            size="lg"
            w="100%"
            colorScheme="teal"
            onClick={handleConexion}
          >
            {isConectado ? 'DESCONECTAR' : 'CONECTAR'}
          </Button>
        )}
      </VStack>
    </Box>
  );
}

export default App;

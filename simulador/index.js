const mqtt = require('mqtt');
const { montarBancos } = require('./bancos');
const { gerarLeitura, criarAleatorio } = require('./leitura');

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const INTERVALO_MS = Number(process.env.INTERVALO_MS || 5000);
const SEMENTE = Number(process.env.SEMENTE || 42);

const bancos = montarBancos();
const aleatorio = criarAleatorio(SEMENTE);
const inicio = Date.now();

async function principal() {
  const clienteMqtt = mqtt.connect(MQTT_URL, { reconnectPeriod: 2000 });
  await new Promise((resolve) => clienteMqtt.on('connect', resolve));
  console.log(`[simulador] MQTT conectado em ${MQTT_URL}`);

  console.log(`[simulador] ${bancos.length} bancos, publicando a cada ${INTERVALO_MS}ms`);

  let ciclo = 0;
  const publicar = async () => {
    const minutos = (Date.now() - inicio) / 60000;
    const leituras = bancos
      .map((banco) => gerarLeitura(banco, minutos, aleatorio))
      .filter(Boolean);

    for (const leitura of leituras) {
      clienteMqtt.publish(
        `moura/telemetria/${leitura.siteId}/${leitura.bancoId}`,
        JSON.stringify(leitura),
        { qos: 1 }
      );
    }

    ciclo += 1;
    if (ciclo % 12 === 0) {
      console.log(`[simulador] ${minutos.toFixed(1)} min | ciclo ${ciclo} | ${leituras.length} leituras publicadas`);
    }
  };

  publicar();
  setInterval(() => {
    publicar().catch((erro) => console.error('[simulador] falha ao publicar:', erro.message));
  }, INTERVALO_MS);
}

principal().catch((erro) => {
  console.error('[simulador] erro fatal:', erro);
  process.exit(1);
});

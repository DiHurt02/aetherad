import fetchAPI from '../api';
import pacienteService from './pacienteService';
import medicoService from './medicoService';
import citaService from './citaService';
import consultaService from './consultaService';
import { estudioService } from './estudioService';
import { vacunaService } from './vacunaService';

export {
  fetchAPI,
  pacienteService,
  medicoService,
  citaService,
  consultaService,
  estudioService,
  vacunaService
};

export default {
  paciente: pacienteService,
  medico: medicoService,
  cita: citaService,
  consulta: consultaService
}; 
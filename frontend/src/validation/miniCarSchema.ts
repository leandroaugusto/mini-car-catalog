import { mixed, number, object, string } from 'yup';

const MINI_SCALE_OPTIONS = ['1:64', '1:32', '1:43', '1:24', '1:18', '1:87'];

export function createMiniCarSchema(mode: 'create' | 'edit') {
  return object({
    carBrand: string().trim().required('Car brand is required'),
    carModel: string().trim().required('Car model is required'),
    carYear: number()
      .typeError('Car year must be a valid year')
      .integer('Car year must be a valid year')
      .min(1900, 'Car year must be a valid year')
      .max(new Date().getFullYear(), 'Car year must be a valid year')
      .required('Car year must be a valid year'),
    miniBrand: string().trim().required('Mini brand is required'),
    collection: string().trim(),
    miniScale: string()
      .trim()
      .oneOf(MINI_SCALE_OPTIONS, 'Mini scale must be selected from the list')
      .matches(/^\d+:\d+$/, 'Mini scale must use the format 1:64')
      .required('Mini scale must use the format 1:64'),
    photo: mixed<File>().nullable(),
  });
}

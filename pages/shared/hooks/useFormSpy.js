import react, { useEffect } from 'react';
import { usePrevious } from './usePrevious'
import _ from 'lodash'


export const useFormSpy = (watch, fieldsToWatch, onChange) => {
  const values = watch(fieldsToWatch)

  const prevValues = usePrevious(values)

  useEffect(() => {
    if (prevValues !== undefined && !_.isEqualWith(values, prevValues)) {
      onChange(values)
    }
  }, [prevValues, values, onChange])
}
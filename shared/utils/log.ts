interface IMeterReading {
  key: string;
  value: number;
  max?: number;
  min?: number;
  steps?: number;
  desiredMax?: number;
  formattedValue?: string | number;
  negChar?: string;
  posChar?: string;
}

export const logMeter = ({
  key,
  value,
  max = 100,
  steps = 20,
  desiredMax,
  formattedValue,
}: IMeterReading): string => {
  const units = Math.min(Math.round((value / max) * steps), steps);
  const desiredMaxUnits = desiredMax
    ? Math.min(Math.round((desiredMax / max) * steps), steps)
    : units;
  let meter = '';
  for (let i = 0; i < steps; ++i) {
    meter = meter + (i < units ? (i < desiredMaxUnits ? '@' : 'X') : '.');
  }
  return `${key} | ${meter} | ${
    typeof formattedValue !== 'undefined' ? formattedValue : value
  }`;
};

export const logThrust = ({
  key,
  value,
  max = 1,
  min = -1,
  steps = 20,
  formattedValue,
  negChar = '<',
  posChar = '>',
}: IMeterReading): string => {
  const units = Math.min(Math.round((value / max) * steps), steps);
  const absValue = Math.abs(value);
  const maxMarkedSteps = Math.round(steps / 2);
  const markedSteps = Math.round(maxMarkedSteps * absValue);

  let meter = '';

  if (absValue === 0) {
    for (let i = 0; i < steps; ++i) {
      meter = meter + '.';
    }
  } else {
    if (value > 0) {
      for (let i = 0; i < steps; ++i) {
        if (i < maxMarkedSteps) {
          meter = meter + '.';
        } else {
          meter = meter + (i < maxMarkedSteps + markedSteps ? posChar : '.');
        }
      }
    } else {
      for (let i = 0; i < steps; ++i) {
        if (i >= maxMarkedSteps) {
          meter = meter + '.';
        } else {
          meter = meter + (i < maxMarkedSteps - markedSteps ? '.' : negChar);
        }
      }
    }
  }

  return `${key} | ${meter} | ${
    typeof formattedValue !== 'undefined' ? formattedValue : value
  }`;
};

/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React from 'react';
import { ResponsiveContainer, XAxis, AreaChart, Area, LabelList, YAxis } from 'recharts';

import Skeleton from 'luminComponents/Shared/Skeleton';

import { useTranslation } from 'hooks';

import { isFirefox } from 'helpers/device';

import dateUtils from 'utils/date';

import { Colors } from 'constants/styles';

import './DashboardAreaChart.scss';

const A_DATE_IN_MILISECOND = 24 * 60 * 60 * 1000;
const TOOLTIP_LINE_POS_Y = 20;
const TOOLTIP_TRANSFORM_X = -32;
const TOOLTIP_TEXT_Y = isFirefox ? 12 : 10;
const TICK_TRANSFORM_LEFT = 25;

const getCurrentDate = () => {
  const current = new Date();
  current.setHours(0);
  current.setMinutes(0);
  current.setSeconds(0);
  current.setMilliseconds(0);
  return current;
};

const getFirstDateOfLastMonth = () => {
  const current = getCurrentDate();
  return new Date(current.getFullYear(), current.getMonth() - 1, 1);
};

const getLastDateOfThisMonth = () => {
  const current = getCurrentDate();
  return new Date(current.getFullYear(), current.getMonth() + 1, 0);
};

const getDatesToLeft = () => {
  const current = getCurrentDate();
  const firstDateInLastMonth = getFirstDateOfLastMonth();
  let tmpDate = current;
  let result = [];
  do {
    tmpDate = new Date(tmpDate.getTime() - A_DATE_IN_MILISECOND);
    if (tmpDate < firstDateInLastMonth) {
      break;
    }
    result = [tmpDate, ...result];
  } while (true);

  return result;
};

const getDatesToRight = () => {
  const current = getCurrentDate();
  const lastDateInThisMonth = getLastDateOfThisMonth();
  let tmpDate = current;
  const result = [];
  do {
    tmpDate = new Date(tmpDate.getTime() + A_DATE_IN_MILISECOND);
    if (tmpDate > lastDateInThisMonth) {
      break;
    }
    result.push(tmpDate);
  } while (true);

  return result;
};

const getFullDate = () => {
  const current = getCurrentDate();
  return [...getDatesToLeft(), current, ...getDatesToRight()];
};

function ChartTick(props) {
  const {
    x,
    y,
    index,
    payload: { value },
    fill,
  } = props;
  const distance = index === 0 ? TICK_TRANSFORM_LEFT : 0;
  return (
    <g transform={`translate(${x + distance},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="end"
        fill={fill || Colors.NEUTRAL_80}
        fontFamily="Axiforma, sans-serif"
        fontSize={10}
        fontWeight={400}
      >
        {value}
      </text>
    </g>
  );
}

function DashboardAreaChart(props) {
  const { data, isIncrease, loading, textColor } = props;
  const { t } = useTranslation();

  const formatData = () => {
    const fullDate = getFullDate();
    const currentDate = dateUtils.formatDateAndMonth(new Date());
    let isAfterCurrent = false;
    return fullDate.map((date) => {
      const name = dateUtils.formatDateAndMonth(date);
      const validDate = data.find((item) => dateUtils.formatDateAndMonth(new Date(item.date)) === name);
      const payload = {
        name,
        value: validDate?.total || null,
      };
      if (!isAfterCurrent) {
        payload.value = payload.value || 0;
      } else {
        payload.value = null;
      }
      if (!isAfterCurrent && name === currentDate) {
        isAfterCurrent = true;
      }
      return payload;
    });
  };

  const getDisplayKeys = () => {
    const firstDateInLastMonth = getFirstDateOfLastMonth();
    const lastDateInThisMonth = getLastDateOfThisMonth();
    return [
      dateUtils.formatDateAndMonth(firstDateInLastMonth),
      dateUtils.formatDateAndMonth(lastDateInThisMonth),
    ].filter((item) => !!item);
  };

  const getColor = () => (isIncrease ? Colors.SUCCESS_50 : Colors.SECONDARY_50);

  const getFillColor = () => (isIncrease ? Colors.SUCCESS_10 : Colors.SECONDARY_10);

  const chartColors = getColor();

  const renderCustomizedLabel = (propsLabel) => {
    const { x, y, value } = propsLabel;
    const currentDate = getCurrentDate();
    if (dateUtils.formatDateAndMonth(currentDate) !== value) {
      return null;
    }
    return (
      <g>
        <rect
          transform={`translate(${x + TOOLTIP_TRANSFORM_X}, 0)`}
          x="0.5"
          y="0.5"
          width="64"
          height="18"
          rx="3.5"
          fill={getFillColor()}
          stroke={chartColors}
        />
        <text
          textAnchor="middle"
          alignmentBaseline="middle"
          fill={chartColors}
          fontSize={10}
          fontWeight={400}
          x={x}
          y={TOOLTIP_TEXT_Y}
        >
          {t('common.today')}
        </text>
        <line
          x1={x}
          y1={TOOLTIP_LINE_POS_Y}
          x2={x}
          y2={y}
          strokeOpacity={1}
          strokeDasharray="4"
          style={{
            stroke: chartColors,
            strokeWidth: 1,
          }}
        />
      </g>
    );
  };

  if (loading) {
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  if (!data.length) {
    return null;
  }

  const formatedData = formatData();
  const keys = getDisplayKeys();

  return (
    <ResponsiveContainer width="99%" height="100%" className="DashboardAreaChart__Container">
      <AreaChart data={formatedData}>
        <XAxis
          dataKey="name"
          tickSize={3}
          tickLine={false}
          interval={0}
          ticks={keys}
          tick={<ChartTick fill={textColor} />}
          stroke={chartColors}
          height={1.5}
        />
        <YAxis hide type="number" domain={['auto', (dataMax) => dataMax * 1.5]} />
        <Area
          isAnimationActive={false}
          type="linear"
          dataKey="value"
          stroke={chartColors}
          fill={getFillColor()}
          fillOpacity={1}
          strokeWidth={1.5}
          connectNulls
        >
          <LabelList dataKey="name" content={renderCustomizedLabel} />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );
}

DashboardAreaChart.defaultProps = {
  data: [],
  isIncrease: true,
  loading: true,
  textColor: Colors.NEUTRAL_80,
};

DashboardAreaChart.propTypes = {
  data: PropTypes.array,
  isIncrease: PropTypes.bool,
  loading: PropTypes.bool,
  textColor: PropTypes.string,
};

export default DashboardAreaChart;

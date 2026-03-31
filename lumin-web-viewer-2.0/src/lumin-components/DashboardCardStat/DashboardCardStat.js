import React from 'react';
import PropTypes from 'prop-types';

import InsightsStats from 'luminComponents/InsightsStats';
import DashboardAreaChart from 'luminComponents/DashboardAreaChart';
import { StyledCardContainer, StyledChart, StyledChartContainer } from './DashboardCardStat.styled';

function DashboardCardStat({
  statistics,
  loading,
  card,
}) {
  const {
    value, text, rating, data,
  } = statistics;

  const noChart = !loading && data.length === 0;

  const renderCardContent = () => {
    const isIncrease = rating >= 0;
    const absRating = Math.abs(rating);
    return (
      <>
        <InsightsStats
          value={value}
          rating={absRating}
          title={text}
          isIncrease={isIncrease}
          loading={loading}
          subtitleShown={statistics.subtitleShown}
        />
        <StyledChartContainer $noChart={noChart}>
          <StyledChart noChart={noChart}>
            <DashboardAreaChart
              data={data}
              isIncrease={isIncrease}
              loading={loading}
            />
          </StyledChart>
        </StyledChartContainer>
      </>
    );
  };

  return (
    <StyledCardContainer
      noChart={!loading && data.length === 0}
      title={card.title}
      iconName={card.icon}
      iconSize={card.size}
      tooltipContent={card.tooltipContent}
      isComment
    >
      {renderCardContent()}
    </StyledCardContainer>
  );
}

DashboardCardStat.propTypes = {
  loading: PropTypes.bool,
  statistics: PropTypes.exact({
    value: PropTypes.number,
    text: PropTypes.string,
    rating: PropTypes.number,
    data: PropTypes.array,
    subtitleShown: PropTypes.bool,
  }),
  card: PropTypes.exact({
    title: PropTypes.node,
    icon: PropTypes.string,
    size: PropTypes.number,
    tooltipContent: PropTypes.node,
  }),
};

DashboardCardStat.defaultProps = {
  loading: true,
  statistics: {
    value: null,
    text: '',
    rate: null,
    data: [],
    subtitleShown: true,
  },
  card: {
    title: '',
    icon: null,
    size: 24,
    tooltipContent: '',
  },
};

export default DashboardCardStat;

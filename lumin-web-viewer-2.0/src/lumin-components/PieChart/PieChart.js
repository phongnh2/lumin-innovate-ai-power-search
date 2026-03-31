import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Pie, Tooltip as RechartTooltip } from 'recharts';
import v4 from 'uuid/v4';

import ChartTooltip from 'luminComponents/ChartTooltip';

import PieChartSkeleton from './PieChartSkeleton';

import * as Styled from './PieChart.styled';

class PieChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHover: false,
      position: {
        x: null,
        y: null,
      },
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { isHover } = this.state;
    if (prevState.isHover && !isHover) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        position: {
          x: null,
          y: null,
        },
      });
    }
  }

  onPieLineEnter = () => {
    this.setState({
      isHover: true,
    });
  };

  onPieLineLeave = () => {
    this.setState({
      isHover: false,
    });
  };

  // eslint-disable-next-line react/sort-comp
  throttleMouseMove = throttle((event) => {
    const { isHover } = this.state;
    if (event !== null && isHover) {
      this.setState({
        position: {
          x: event.chartX,
          y: event.chartY,
        },
      });
    }
  }, 500);

  onMouseMove = (event) => {
    this.throttleMouseMove(event);
  };

  getTotal = () => {
    const { segments } = this.props;
    return segments.reduce((acc, current) => (acc + current.value), 0);
  };

  renderTooltip = (props) => {
    const { active, payload } = props;
    const { position } = this.state;
    if (position.x === null || position.y === null) return null;
    const total = this.getTotal();

    if (!active || payload.length === 0) {
      return null;
    }

    const { value = 0 } = payload[0] || {};
    const percent = (value / total * 100).toFixed(2);
    return (
      <ChartTooltip {...props}>
        <span>{`${percent}%`}</span>
      </ChartTooltip>
    );
  };

  isEmptySegments = () => {
    const { segments } = this.props;
    return !segments || segments.length === 0 || !segments.every((item) => Number.isInteger(item.value));
  };

  render() {
    const { position } = this.state;
    const { loading, segments, t } = this.props;
    if (loading) {
      return <PieChartSkeleton />;
    }
    if (this.isEmptySegments()) return null;

    const reverseSegments = [...segments].reverse();
    const shouldDisplay = !reverseSegments.every((item) => item.value === 0);
    if (!shouldDisplay) {
      return null;
    }
    return (
      <Styled.StyledContainer>
        <Styled.StyledChart>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart
              outerRadius="100%"
              startAngle={0}
              endAngle={480}
              onMouseMove={this.onMouseMove}
            >
              <Pie
                stroke="none"
                isAnimationActive={false}
                data={reverseSegments}
                startAngle={90}
                endAngle={480}
                innerRadius="78%"
                outerRadius="100%"
                paddingAngle={0}
                dataKey="value"
                fill="#8884d8"
                animationDuration={700}
                animationBegin={500}
                onMouseEnter={this.onPieLineEnter}
                onMouseLeave={this.onPieLineLeave}
                tabIndex={-1}
                rootTabIndex={-1}
              >
                {reverseSegments.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <RechartTooltip
                position={position}
                offset={0}
                content={this.renderTooltip}
                wrapperStyle={{
                  zIndex: 1,
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          <Styled.MiddleCircleChart />
        </Styled.StyledChart>
        <Styled.StyledLegendContainer>
          <ul>
            {segments.map((item) => (
              <Styled.StyledLegendItem key={v4()}>
                <Styled.StyledLegendItemRow>
                  <Styled.StyledLegendBlock>
                    <Styled.DescriptionColor style={{ backgroundColor: item.color }} />
                  </Styled.StyledLegendBlock>
                  <Styled.TextContainer>
                    <Styled.LegendValue>{item.value}&nbsp;</Styled.LegendValue>
                    <Styled.StyledLegendContent>{t(item.name)}</Styled.StyledLegendContent>
                  </Styled.TextContainer>
                </Styled.StyledLegendItemRow>
              </Styled.StyledLegendItem>
            ))}
          </ul>
        </Styled.StyledLegendContainer>
      </Styled.StyledContainer>
    );
  }
}

PieChart.propTypes = {
  loading: PropTypes.bool,
  segments: PropTypes.array,
  t: PropTypes.func,
};

PieChart.defaultProps = {
  loading: true,
  segments: [],
  t: () => {},
};

export default withTranslation()(PieChart);

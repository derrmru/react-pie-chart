import React, { useEffect, useRef } from 'react';
import { select, selectAll } from 'd3-selection';
import { pie, arc } from 'd3-shape';
import { interpolate } from 'd3-interpolate';
import { schemeSet2 } from 'd3-color';
import { transition } from 'd3-transition';
import './PieChart.css';

const D3 = Object.assign(
  {
    select,
    selectAll,
    pie,
    arc,
    interpolate,
    schemeSet2,
    transition,
  },
  {}
);

const PieChart = ({
  data,
  width,
  height,
  thickness,
  colors,
  animation,
  legendPosition,
}) => {
  //if colors.length < data.length return null
  if (colors && colors.length < data.length) {
    console.log('Dataset requires larger color scheme');
    return null;
  }

  const ref = useRef();
  const legend = useRef();

  /**
   * THE PIE
   */

  //determine radius and inner radius
  const radius = Math.min(width, height) / 2;
  const innerRadius = (radius / 100) * thickness;
  const total = data.reduce((total, cur) => (total += cur.value), 0);

  useEffect(() => {
    const svg = D3.select(ref.current);

    //Append a 'g' for each data point
    const g = svg
      .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    //The PIE
    const pie = D3.pie().value((d) => d.value);
    const sortedPie = pie(data).sort((a, b) => a.data.value - b.data.value);

    // Creating arc
    const arc = D3.arc().innerRadius(innerRadius).outerRadius(radius);

    // Grouping different arcs
    var arcs = g.selectAll('arc').data(sortedPie).enter().append('g');

    // Appending paths
    if (!animation) {
      arcs
        .append('path')
        .attr('fill', (data, i) =>
          colors ? colors[data.index] : D3.schemeSet2[i]
        )
        .attr('d', arc);
    }

    if (animation) {
      arcs
        .append('path')
        .attr('fill', (data, i) =>
          colors ? colors[data.index] : D3.schemeSet2[i]
        )
        .attr('d', arc)
        .transition()
        .duration(1500)
        .attrTween('d', (d) => {
          const i = D3.interpolate(d.startAngle + 0.1, d.endAngle);
          return (t) => {
            d.endAngle = i(t);
            return arc(d);
          };
        });
    }

    arcs
      .attr('class', 'arcs')
      .append('title')
      .text((d) => `${d.data.name}: ${((d.value / total) * 100).toFixed(2)}%`);

    //if data or props are updated during render, then d3.exit
    arcs.exit().remove();

    /**
     * THE LEGEND
     */
    const leg = D3.select(legend.current);

    leg.attr('class', 'legend ' + `${animation && 'slide'}`);

    const legendItem = leg.selectAll('div').data(sortedPie.reverse()).enter();

    legendItem
      .append('div')
      .attr('class', 'keys')
      .attr(
        'style',
        (d, i) =>
          `background-color: ${colors ? colors[i] : schemeSet2[i]
          }; min-width: 15%; text-align: center;`
      )
      .html(
        (d) =>
          `<div>
          ${d.data.name[0].toUpperCase() + d.data.name.slice(1).toLowerCase()}:
          ${((d.value / total) * 100).toFixed(2)}%
          </div>`
      );

    legendItem.exit().remove();
  }, [data]);

  return (
    <div
      className="layout"
      style={
        legendPosition === 'bottom'
          ? { flexDirection: 'column' }
          : legendPosition === 'left'
            ? { flexDirection: 'row-reverse', alignItems: 'center' }
            : legendPosition === 'top'
              ? { flexDirection: 'column-reverse' }
              : { flexDirection: 'row', alignItems: 'center' }
      }
    >
      <svg ref={ref} viewBox={`0 0 ${width} ${height}`}></svg>
      <div
        ref={legend}
        style={
          legendPosition === 'left' ||
            legendPosition === 'right' ||
            !legendPosition
            ? {
              width: '40%',
              justifyContent: 'space-around',
              margin: '20px',
            }
            : {}
        }
      />
    </div>
  );
};

export default PieChart;

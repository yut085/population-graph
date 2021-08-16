import React, { Component } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import documents from "./documents";
import theme from "./theme";

class PopulationGraph extends Component {
  constructor() {
    super();
    this.state = {
      selected: Array(47).fill(false),
      prefectures: {},
      series: []
    };
    this.chagePrefectures = this.chagePrefectures.bind(this);
  }

  componentDidMount() {
    fetch("https://opendata.resas-portal.go.jp/api/v1/prefectures", {
      headers: { "X-API-KEY": documents.api.myApi }
    })
      .then(response => response.json())
      .then(res => {
        this.setState({ prefectures: res.result });
      });
  }

  chagePrefectures(index) {
    const selected_copy = this.state.selected.slice();
    selected_copy[index] = !selected_copy[index];

    if (!this.state.selected[index]) {
      fetch(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?prefCode=${index +
          1}`,
        {
          headers: { "X-API-KEY": documents.api.myApi }
        }
      )
        .then(response => response.json())
        .then(res => {
          let tmp = [];
          for (let j = 0; j < 18; j++) {
            tmp.push(res.result.data[0].data[j].value);
          }
          const res_series = {
            name: this.state.prefectures[index].prefName,
            data: tmp
          };
          this.setState({
            selected: selected_copy,
            series: [...this.state.series, res_series]
          });
        });
    } else {
      const series_copy = this.state.series.slice();
      for (let i = 0; i < series_copy.length; i++) {
        if (series_copy[i].name == this.state.prefectures[index].prefName) {
          series_copy.splice(i, 1);
        }
      }
      this.setState({
        selected: selected_copy,
        series: series_copy
      });
    }
  }

  renderButton(props) {
    return (
      <div key={props.prefCode} style={theme.buttonStyle}>
        <input
          type="checkbox"
          checked={this.state.selected[props.prefCode - 1]}
          onChange={() => this.chagePrefectures(props.prefCode - 1)}
        />
        {props.prefName}
      </div>
    );
  }

  render() {
    const obj = this.state.prefectures;
    const options = {
      title: {
        text: documents.title.titleText
      },
      xAxis: {
        title: {
          text: documents.xLabel.title.text
        }
      },
      yAxis: {
        title: {
          text: documents.yLabel.title.text
        }
      },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: documents.label
          },
          pointInterval: documents.pointInterval,
          pointStart: documents.pointStart
        }
      },
      series: this.state.series
    };
    return (
      <div>
        <div style={theme.graphStyle}>{documents.text.graphTitle}</div>
        <div>{documents.pref.prefName}</div>

        {Object.keys(obj).map(i => this.renderButton(obj[i]))}
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  }
}

export default PopulationGraph;

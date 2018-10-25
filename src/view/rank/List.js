import React from 'react'
import WrappedComponent from '../../hoc/Index'
import $http from '../../axios'
import Title from '../../component/title/Title'
import { Icon,Grid } from 'antd-mobile'
import BScroll from 'better-scroll'
import './ranklist.css'
const options = {
    click:true,
    scrollbar:true,
    fade: true,
    probeType: 3
}
options.pullDownRefresh = {
    threshold: 90, // 当下拉到超过顶部 50px 时，触发 pullingDown 事件
    stop: 40 // 刷新数据的过程中，回弹停留在距离顶部还有 20px 的位置
}
options.pullUpLoad = {
    threshold: -60, // 在上拉到超过底部 20px 时，触发 pullingUp 事件
    moreTxt: 'Load More',
    noMoreTxt: 'There is no more data'
}
class List extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            info: '',
            list: [],
            pageSize: 30,
            page: 1,
            total:0,
            height:document.documentElement.clientHeight,
            refreshing:false,
            bg:'rgba(98,98,98,0.3)',
            scroller:false,
            enablescroll: true,
            load: ''
        }
        this.getData();

    }

    componentDidUpdate() {
        if(this.state.scroller){
            this.state.scroller.refresh()
        }else{
            this.setState({
                scroller: new BScroll(this.refs.listWrpper,options)
            })
        }
    }

    getData(callback){
        $http.get('/proxy/rank/info/&json=true',{
            params:{
                rankid:this.props.match.params.id,
                page:this.state.page
            }
        }).then(res => {
            const data = res.data;
            const arr = this.state.list;
            arr.push(...data.songs.list)
            arr.map(item => {
                return item.open ? item.open = true : item.open = false
            })
            this.setState({
                info: data.info,
                list: arr,
                total:data.songs.total
            })
            const count = data.songs.pagesize * data.songs.page;
            if(count < data.songs.total){
                this.setState({
                    load: '下拉加载'
                })
            }else{
                this.setState({
                    load: '没有更多数据'
                })
            }

            if(typeof callback === 'function'){
                callback()
            }
        })
    }
    deal(item,e){
        e.stopPropagation();
        const list = this.state.list;
        list.filter( res => {
            if(item.audio_id === res.audio_id){
                res.open = !res.open
            }else{
                res.open = false
            }
            return res
        } )
        this.setState({
            list: list
        })
    }
    render(){
        if(this.state.scroller){

            this.state.scroller.on('scroll',(pos) => {


            })
            this.state.scroller.on('scrollEnd',(pos) => {

            })
            this.state.scroller.on('pullingDown',() => {
                //获取最新数据
                setTimeout(() => {
                    this.state.scroller.finishPullDown()
                    this.state.scroller.scrollTo(0,0,0)
                },1000)

            })
            this.state.scroller.on('pullingUp',() => {
                const count = this.state.page * this.state.pageSize
                if(this.state.enablescroll && count < this.state.total){
                    this.setState({
                        enablescroll: false,
                        page: this.state.page + 1,
                        load:'加载中....'
                    })
                    this.getData(() => {
                        this.state.scroller.finishPullUp();
                        this.setState({
                            enablescroll: true
                        })
                    })
                }
            })


        }
        const list = [
            'check-circle',
            'cross-circle', 'cross',
            'ellipsis','loading'
        ];


        const grid = list.map(item => ({
            icon: (<Icon type={item} />),
            text: item,
        }));

        var imgUrl = this.state.info.banner7url;
        if(imgUrl !== undefined){
            imgUrl = imgUrl.replace('{size}','400')
        }
        return(
            <div className="rank-list">
                <Title title={this.state.info.rankname} bg={this.state.bg}/>

                <div className="list-wrap" ref="listWrpper">
                    <div className="listContain">
                        <div className="kv-wrap">
                            <img src={imgUrl}  className="kv" alt=""/>
                        </div>
                        <div>
                            {this.state.list.length > 0 && this.state.list.map((item,index) => (
                                <div key={index} className="listItem">
                                    <div className="item-wrap" onClick = {this.props.play.bind(this,this.state.list,index,item.hash)}>
                                        <div className="rank-index">
                                            <span className={index < 3 ? 'front' : ''}> {index + 1} </span>
                                        </div>
                                        <div className="song-name">{item.filename}</div>
                                        <div className="deal" onClick={this.deal.bind(this,item)}>
                                            <Icon type={item.open ? 'down' : 'right'} />
                                        </div>
                                    </div>
                                    {
                                        item.open && (
                                            <div className="deal-action">
                                                <Grid data={grid} columnNum={5} hasLine={false} activeStyle={false} onClick={(_el,index) => console.log(index)}/>
                                            </div>
                                        )
                                    }
                                </div>
                            ))}
                        </div>
                        <div className="bottom-state">
                            {this.state.load}
                        </div>
                    </div>


                </div>

            </div>
        )
    }
}

List = WrappedComponent(List)

export default List
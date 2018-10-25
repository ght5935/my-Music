import React from 'react'
import $http from '../../axios'
import Title from '../../component/title/Title'
import {Icon} from 'antd-mobile'
import BScroll from 'better-scroll'
import './list.css'
import history from '../../history'
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
class SingerList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            list: [],
            title:'',
            pagesize:0,
            total:0,
            page:1,
            bg:'rgba(98,98,98,0.3)',
            load: '',
            enablescroll: true,
            scroller: false,
        }
        this.getData()
    }
    componentDidUpdate() {
        if(this.state.scroller){
            this.state.scroller.refresh()
        }else{
            this.setState({
                scroller: new BScroll(this.list,options)
            })
        }
    }

    getData(callback){
        $http.get('/proxy/singer/list/?json=true',{
            params:{
                classid: this.props.match.params.id,
                page: this.state.page
            }
        }).then(res => {
            const arr = this.state.list;
            arr.push(...res.data.singers.list.info);
            this.setState({
                list: arr,
                page: res.data.singers.page,
                pagesize: res.data.singers.pagesize,
                total: res.data.singers.list.total,
                title: res.data.classname
            })

            const count = res.data.singers.page * res.data.singers.pagesize
            if(count < res.data.singers.list.total){
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

    page(item){
        history.push('/songs/'+item)
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
                const count = this.state.page * this.state.pagesize
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
        const list = this.state.list.length > 0 && this.state.list.map((item,index) => (
                <div className="item" key={index}>
                    <div className="singers" onClick={this.page.bind(this,item.singerid)}>
                        <div className="singer-img">
                            <img src={item.imgurl.replace('{size}','400')} alt=""/>
                        </div>
                        <div className="name text-hide">
                            {item.singername}
                        </div>
                        <div className="icon">
                            <Icon type="right"/>
                        </div>
                    </div>
                </div>
            ))
        return (
            <div className="singer-list-wrap">
                <Title title={this.state.title} bg={this.state.bg}/>
                <div className="singer-list" ref={el => this.list = el}>
                    <div className="container">
                        {list}
                        <div className="bottom-state">
                            {this.state.load}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SingerList
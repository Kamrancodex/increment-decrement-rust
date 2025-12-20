struct Shape<T>{
    height:T,
    width:T
}
fn main() {
    let square = Shape { height: 1, width: 2 };
    println!("{}", square.height);
}
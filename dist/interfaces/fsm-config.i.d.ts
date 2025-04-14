interface FSMConfigI {
    state: string;
    event: string;
    transitionFn: any;
    data: any;
}
export default FSMConfigI;

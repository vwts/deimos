import definePlugin from '../utils/types';

export default definePlugin({
    name: "foo",
    description: "apenas para teste",
    author: ["vuwints"],

    start() {
        console.log("foo");
    }
});
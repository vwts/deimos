import definePlugin from '../utils/types';

export default definePlugin({
    name: "bar",
    description: "apenas para teste",
    author: ["vuwints"],

    start() {
        console.log("bar");
    }
});
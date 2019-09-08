import {Message} from './Message';

interface MessageDB {
    add(msg: Message): void;
    remove(predicate: (msg: Message) => boolean): Promise<Message>;
}

class MessageCoreDB implements MessageDB {
    private items: Message[] = [];
    private predicate: ((item: Message) => boolean) | null = null;
    private resolve: ((item: Message) => void) | null = null;

    add(item: Message): void {
        this.items.push(item);
        this.tryResolve();
    }

    async remove(predicate: (item: Message) => boolean): Promise<Message> {
        let promise = new Promise<Message>((resolve, reject) => {
            this.predicate = predicate;
            this.resolve = resolve;
        });
        this.tryResolve();
        return promise;
    }

    private tryResolve(): void {
        if ( this.predicate && this.resolve ) {
            let item: Message|null = null;
            let index = 0;
            for (let msg of this.items) {
                if (this.predicate(msg)) {
                    item = msg;
                    break;
                }
                index++;
            }
            if (item) {
                this.resolve(item);
                this.items.splice(index, 1);
                this.predicate = null;
                this.resolve = null;
            }
        }
    }
}

const messageDB:MessageDB = new MessageCoreDB();

export {messageDB}
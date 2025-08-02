export class BeanstalkdProtocol {}

/**
 * tube name validation
 */
/*

#define NAME_CHARS \
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" \
    "abcdefghijklmnopqrstuvwxyz" \
    "0123456789-+/;.$_()"

static bool
is_valid_tube(const char *name, size_t max)
{
    size_t len = strlen(name);
    return 0 < len && len <= max &&
        strspn(name, NAME_CHARS) == len &&
        name[0] != '-';
}

*/
